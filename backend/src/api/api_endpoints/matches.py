from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from database.models import Match, Player
from ..serializer import MatchSerializer

class ViewMatches(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def get(self, request, format=None):
        p_all = MatchSerializer(Match.objects.all(), many=True)
        return Response(p_all.data)
    
    def post(self, request, format=None):
        data = request.data

        attacker = get_object_or_404(Player, username=data["attacker"])
        defender = get_object_or_404(Player, username=data["defender"])
        try:
            attacker_score = int(data["attacker_score"])
            defender_score = int(data["defender_score"])
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        time_played = timezone.localtime()

        new_m = Match(
            attacker=attacker, 
            defender=defender,
            time_played=time_played,
            attacker_score=attacker_score,
            defender_score=defender_score
        )
        new_m.save()

        return Response(status=status.HTTP_201_CREATED)