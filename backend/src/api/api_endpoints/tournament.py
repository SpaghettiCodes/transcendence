from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework import status
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404

from tournament_server.manager import TournamentManager
from database.models import Tournament
from ..serializer import TournamentSerializer
from util.base_converter import from_base52, to_base52

class TournamentView(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # new match
    def post(self, request: Request, format = None):
        server_id = TournamentManager.new_tournament()

        if server_id == None:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "tournament_id": server_id
        }, status=status.HTTP_201_CREATED)

    # random matchmaking
    def get(self, request: Request, format = None):
        server_id = TournamentManager.randomMatchmake()

        return Response({
            "tournament_id": server_id
        }, status=status.HTTP_200_OK)

@api_view(["GET"])
def specificTournamentDetails(request: Request, tournament_id):
    data = TournamentManager.getTournamentJsonDetails(tournament_id)
    if data is None:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(data, status=status.HTTP_200_OK)

@api_view(["GET"])
def specificTournamentResults(request: Request, tournament_id):
    tournamentObject = get_object_or_404(Tournament.objects, tournamentid=tournament_id)
    serialized = TournamentSerializer(tournamentObject)
    return Response(serialized.data)