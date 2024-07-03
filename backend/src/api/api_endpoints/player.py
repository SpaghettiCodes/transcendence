from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from django.middleware import csrf
from database.models import Player
from ..serializer import PlayerSerializer, PublicPlayerSerializer
from ..token import create_jwt_pair_for_user
from django.core.exceptions import FieldDoesNotExist
from django.core.files.images import ImageFile
from django.conf import settings

from django.db.utils import IntegrityError

class ViewPlayers(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def post(self, request: Request, format=None):
        data = request.data
        if Player.objects.filter(username=data["username"]).exists():
            return Response (
                {"detail": "User already exist"},
                status=status.HTTP_409_CONFLICT
            )

        new_p = Player(username=data["username"])
        new_p.save()
        return Response(status=status.HTTP_201_CREATED)

    def get(self, request, format=None):
        p_all = PublicPlayerSerializer(Player.objects.all(), many=True)
        return Response(p_all.data)
    
@api_view(['POST'])
def createPlayer(request):
    for field in request.data.keys():
        try:
            Player._meta.get_field(field)
        except FieldDoesNotExist:
            return Response(
                {"Error": f"Field '{field}' does not exist in player model"},
                status=status.HTTP_400_BAD_REQUEST
            )

    data=request.data
    if 'password' in data.keys():
        raw_password = data.get('password')
        data['password'] = Player.encrypt_password(raw_password)

    if 'profile_pic' in request.FILES:
        profile_pic = ImageFile(request.FILES['profile_pic'])
        profile_pic.name = request.FILES['profile_pic'].name
        request.data['profile_pic'] = profile_pic

    serializer = PlayerSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
        return Response(
            {"Error": "Failed to add player into Database"},
            status=status.HTTP_400_BAD_REQUEST
            )

    return Response(serializer.data)

@api_view(['POST'])
def login(request):
    data = request.data
    try:
        username = data.get('username')
        raw_password = data.get('password')
    except FieldDoesNotExist:
        return Response(
            {"Error": "username/password not given"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    p = get_object_or_404(Player.objects, username=username)

    if p.verify_password(raw_password=raw_password):
        data = create_jwt_pair_for_user(p)
        response = Response()
        response.set_cookie(
							key = settings.SIMPLE_JWT['AUTH_COOKIE'], 
							value = data["access"],
							expires = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
							secure = settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
							httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
							samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
								)
        response.data = {"Success" : "Login successfully","data":data}       
        return response
    else:
        return Response({"Error": 'Password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST)



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
