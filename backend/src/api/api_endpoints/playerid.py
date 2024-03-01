from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from database.models import Player
from ..serializer import PlayerSerializer, MatchSerializer

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