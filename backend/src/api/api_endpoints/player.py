
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from database.models import Player
from ..serializer import PlayerSerializer, PublicPlayerSerializer

from django.db.utils import IntegrityError

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

