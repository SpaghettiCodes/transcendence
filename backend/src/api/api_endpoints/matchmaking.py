from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from pong_server.server import PongServer
from rest_framework import status

import asyncio

@api_view(['GET'])
def createNewGame(request):
    server_id = asyncio.run(PongServer.new_game())

    return Response({
        "game_id": server_id
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def matchmake(request):
    server_id = asyncio.run(PongServer.random_matchmake())

    return Response({
        "game_id": server_id
    }, status=status.HTTP_200_OK)
