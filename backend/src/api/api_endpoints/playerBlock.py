from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework import status

from django.shortcuts import get_object_or_404

from database.models import Player
from ..serializer import PublicPlayerSerializer

class ViewBlocked(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]
    
    # get lised of block people
    def get(self, request: Request, player_username, format=None):
        user = get_object_or_404(Player, username=player_username)
        return Response(PublicPlayerSerializer(user.blocked.all(), many=True).data)

    # add someone to block
    def post(self, request: Request, player_username, format=None):
        target_username = request.data.get('target')
        if target_username is None:
            return Response(
                {"error": "target username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if player_username == target_username:
            return Response(
                {"error": "can't block yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        p_target = get_object_or_404(Player.objects, username=target_username)
        p_player = get_object_or_404(Player.objects, username=player_username)

        p_player.block_player(p_target)
        return Response(status=status.HTTP_201_CREATED)

    # unblock someone
    def delete(self, request: Request, player_username, format=None):
        target_username = request.data.get('target')
        if target_username is None:
            return Response(
                {"error": "target username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if player_username == target_username:
            return Response(
                {"error": "can't unblock yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        p_target = get_object_or_404(Player.objects, username=target_username)
        p_player = get_object_or_404(Player.objects, username=player_username)

        p_player.unblock_player(p_target)
        return Response(status=status.HTTP_201_CREATED)
