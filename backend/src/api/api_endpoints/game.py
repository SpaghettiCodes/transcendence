from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from pong_server.server import PongServer
from rest_framework import status

import asyncio

class GameView(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # CREATE A NEW GAME
    def post(self, request: Request, format = None):
        data = request.data
        server_id = asyncio.run(PongServer.new_game(type=data["type"]))

        if server_id == None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "game_id": server_id
        }, status=status.HTTP_200_OK)

    # RANDOM MATCHMAKING
    def get(self, request: Request, format = None):
        server_id = asyncio.run(PongServer.random_matchmake())

        return Response({
            "game_id": server_id
        }, status=status.HTTP_200_OK)

@api_view(["GET"])
def specificGameGet(request, game_id, tournament_id=None):
    try:
        return Response(PongServer.getDetails(game_id, tournament_id))
    except Exception as e:
        print("uh oh stinky")
        print(e)
        return Response(status=status.HTTP_404_NOT_FOUND)