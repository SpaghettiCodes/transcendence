from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework import status
from rest_framework.views import APIView

from tournament_server.manager import TournamentManager

import asyncio

class TournamentView(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def post(self, request: Request, format = None):
        server_id = asyncio.run(TournamentManager.new_tournament())

        if server_id == None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "tournament_id": server_id
        }, status=status.HTTP_200_OK)

    def get(self, request: Request, format = None):
        return Response(TournamentManager.getAllDetails(), status=status.HTTP_200_OK)

@api_view(["GET"])
def specificTournamentDetails(request: Request, tournament_id):
    data = TournamentManager.getTournamentJsonDetails(tournament_id)
    if data is None:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(data, status=status.HTTP_200_OK)
