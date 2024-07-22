from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from django.middleware import csrf
from database.models import Player, Two_Factor_Authentication
from ..token import create_jwt_pair_for_user
from django.core.exceptions import FieldDoesNotExist
from django.core.files.images import ImageFile
from django.conf import settings

from django.db.utils import IntegrityError
from ..serializer import PlayerSerializer, PublicPlayerSerializer, MatchSerializer, ChatRoomSerializer

class ViewPlayers(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # for testing purposes only
    def get(self, request, format=None):
        print(request.user)
        p_all = PublicPlayerSerializer(Player.objects.all(), many=True)
        return Response(p_all.data)

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
        p.now_online()
        data = create_jwt_pair_for_user(p)
        response = Response()

        response.data = {"Success" : "Login successfully", "data": data}
        return response
    else:
        return Response({"Error": 'Password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST)

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
        new_player = get_object_or_404(Player.objects, username=data.get('username'))
        Two_Factor_Authentication.objects.create(player_id=new_player.id)
    else:
        print(serializer.errors)
        errorOfList = []
        for field, errorList in serializer.errors.items():
            for error in errorList:
                message = f"{field}: {error.title()}"
                errorOfList.append(message)
        return Response({
                "error": "Failed to add player into Database",
                "reason": errorOfList
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(status=status.HTTP_201_CREATED)

@api_view(['GET'])
def SpecificPlayerMatches(request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    m = p.attacker.all() | p.defender.all()
    m = m.order_by("time_played")
    serialized = MatchSerializer(m, many=True)
    return Response(serialized.data)

@api_view(['GET'])
def SpecificPlayerChats(request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    c = (p.members.all() | p.owner.all()).distinct()
    serialized = ChatRoomSerializer(c, many=True)
    return Response(serialized.data)

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
