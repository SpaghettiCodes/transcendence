from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from database.models import Player
from ..serializer import PlayerSerializer, PublicPlayerSerializer, MatchSerializer, ChatRoomSerializer

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

def getSpecificPlayer(player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    serialized = PlayerSerializer(p)
    return Response(serialized.data)

def removeSpecificPlayer(player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    p.delete()
    return Response(status=status.HTTP_200_OK)

@api_view(['DELETE', 'GET'])
def SpecificPlayer(request, player_username):
    match request.method:
        case 'DELETE':
            return removeSpecificPlayer(player_username)
        case 'GET':
            return getSpecificPlayer(player_username)

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
    c = p.members.all() | p.owner.all()
    serialized = ChatRoomSerializer(c, many=True)
    return Response(serialized.data)
