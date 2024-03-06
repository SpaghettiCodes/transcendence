from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from pong_server.server import PongServer
from rest_framework import status

import asyncio

class ViewPongMatches(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # honestly? might make this a websocket instead :P
    def get(self, request, format=None):
        server_data = PongServer.get_servers_list()
        return Response(server_data)

    def post(self, request, format=None):
        server_id = asyncio.run(PongServer.new_game())

        return Response({
            "game_id": server_id
        }, status=status.HTTP_200_OK)
