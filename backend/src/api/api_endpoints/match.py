from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from pong_server.server import PongServer
from rest_framework import status

from datetime import datetime

class MatchView(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # CREATE A NEW GAME
    def post(self, request: Request, format = None):
        data = request.data
        server_id = PongServer.new_game(type=data["type"])
        # server_id = asyncio.run(PongServer.new_game(type=data["type"]))

        if server_id == None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "game_id": server_id
        }, status=status.HTTP_201_CREATED)

    # RANDOM MATCHMAKING
    def get(self, request: Request, format = None):
        type = request.GET.get("type")

        server_id = PongServer.random_matchmake(type)
        if server_id is not None:
            return Response({
                "game_id": server_id
            }, status=status.HTTP_200_OK)
        
        if not PongServer.matchMaking(type):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # wait for 10 seconds
        # now its 3, cuz idw wait 10 years
        duration = 3
        durationLeft = duration
        timeStart = datetime.now()

        while (durationLeft >= 0.25):
            currentTime = datetime.now()
            difference = (currentTime - timeStart).total_seconds()
            durationLeft = max(0, duration - difference)

            server_id = PongServer.random_matchmake(type)
            if server_id is not None:
                break

        PongServer.dismatchMaking(type)
        if server_id == None:
            return Response(status=status.HTTP_408_REQUEST_TIMEOUT)

        return Response({
            "game_id": server_id
        }, status=status.HTTP_200_OK)

@api_view(["GET"])
def specificMatchGet(request, match_id, tournament_id=None):
    try:
        return Response(PongServer.getDetails(match_id, tournament_id))
    except Exception as e:
        print("uh oh stinky")
        print(e)
        return Response(status=status.HTTP_404_NOT_FOUND)
