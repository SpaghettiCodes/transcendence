from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from django.middleware import csrf
from database.models import Player, TwoFactorAuthentication
from ..token import create_jwt_pair_for_user
from django.core.exceptions import FieldDoesNotExist, ObjectDoesNotExist
from django.core.files.images import ImageFile
from django.conf import settings

from ..serializer import PublicPlayerSerializer, PlayerCreator
from rest_framework.serializers import StringRelatedField

from passlib.exc import PasswordSizeError

import random
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample,  OpenApiParameter

class ViewPlayers(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # for testing purposes only
    def get(self, request, format=None):
        print(request.user)
        p_all = PublicPlayerSerializer(Player.objects.all(), many=True)
        return Response(p_all.data)
    # please remove when done

@extend_schema(
        summary="Login Endpoint",
        description="API endpoint for users to log in",
        request=StringRelatedField,
        examples=[
            OpenApiExample("Example of login details", {
                "username": "username",
                "password": "password"
            }, request_only=True)
        ],
        responses={400: None,
                   404: None,
                   200: OpenApiResponse(
                       StringRelatedField,
                       "auth tokens to use the API",
                       [
                           OpenApiExample("Example of successful response", {
                               "success": "login successfully",
                               "data" : {
                                   "access": "access_token",
                                   "refresh": "refresh_token"
                               }
                           })
                       ]
                       )}
)
@api_view(['POST'])
def login(request):
    data = request.data # son, this is a dict son

    username = data.get('username')
    raw_password = data.get('password')

    if username is None:
        return Response(
            {
                "error": "missing details",
                "reason": {
                    "username": ["username not given"]
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if raw_password is None:
        return Response(
            {
                "error": "missing details",
                "reason": {
                    "password": ["password not given"]
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    p = get_object_or_404(Player.objects, username=username)

    if p.verify_password(raw_password=raw_password):
        if p.has_tfa_activated():
            return Response(status=status.HTTP_403_FORBIDDEN)

        p.now_online()
        data = create_jwt_pair_for_user(p)
        return Response(
            {
                "success" : "Login successfully", 
                "data": data
            }
        , status=status.HTTP_200_OK)
    else:
        return Response(
            {
                "error": "password is incorrect"
            },
            status=status.HTTP_401_UNAUTHORIZED)

@extend_schema(
        summary="Register endpoint",
        description="Allows user to sign up a new account",
        request=StringRelatedField,
        examples=[
            OpenApiExample("Example of user signing up", {
                'username': 'username',
                'password': 'password'
            }, request_only=True)
        ],
        responses={400: OpenApiResponse(None, "May have a list of reasons for failure"),
                   200: None}
)
@api_view(['POST'])
def createPlayer(request):
    for field in request.data.keys():
        try:
            Player._meta.get_field(field)
        except FieldDoesNotExist:
            return Response(
                {"error": f"Field '{field}' does not exist in player model"},
                status=status.HTTP_400_BAD_REQUEST
            )

    data=request.data
    if 'username' in data.keys():
        try:
            Player.objects.get(username=data['username'])
            return Response(status=status.HTTP_409_CONFLICT)
        except ObjectDoesNotExist:
            pass
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if 'password' in data.keys():
        raw_password = data.get('password')
        try:
            data['password'] = Player.encrypt_password(raw_password)
        except PasswordSizeError:
            return Response(
                {'error': "Password is too long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    serializer = PlayerCreator(data=data)

    if serializer.is_valid():
        serializer.save()

        new_player = get_object_or_404(Player.objects, username=data.get('username'))
        TwoFactorAuthentication.objects.create(player_id=new_player.id) # i will not comment on this

        new_player.now_online()
        data = create_jwt_pair_for_user(new_player)
        return Response({
            "success" : "Register success",
            "data": data
        }, status=status.HTTP_201_CREATED)
    else:
        print(serializer.errors)
        errorOfList = {}
        for field, errorList in serializer.errors.items():
            fieldErrors = []
            for error in errorList:
                fieldErrors.append(error.capitalize())
            errorOfList[field] = fieldErrors
        return Response({
                "error": "Failed to add player into Database",
                "reason": errorOfList
            },
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
def selectNRandomPlayers(request: Request):
    # apparantly order_by('?') is slow for some database
    # i cba to check if postgres is slow, so

    callerUsername = request.user.username

    list_of_usernames = Player.objects.exclude(username=callerUsername).values_list('username', flat=True)
    list_of_usernames = list(list_of_usernames)
    number = request.GET.get('number')
    if (not number):
        number = 5
    else:
        try:
            number = int(number)
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    print(list_of_usernames)
    number = min(len(list_of_usernames), number)
    rand_username = random.sample(list_of_usernames, number)
    p_all = PublicPlayerSerializer(Player.objects.filter(username__in=rand_username), many=True)

    return Response(p_all.data)

@api_view(['POST'])
def logout(request: Request):
    requester = request.user
    requester.now_offline()

    return Response(
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
def checkIn(request: Request):
    requester = request.user()
    requester.now_online()
    return Response(
        status=status.HTTP_200_OK
    )


"""
test:

{
"username":"e",
"password":"eee",
"email":"e@e.com"
}

{
"username":"e",
"password":"eee"
}

"""
