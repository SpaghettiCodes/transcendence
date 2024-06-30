from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView

from database.models import ChatRoom, Player
from ..serializer import ChatRoomSerializer

class Chat(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def post(self, request: Request, format = None):
        data = request.data

        owner_username = data["username"]
        owner = get_object_or_404(Player, username=owner_username)
        chatroom_title = data["chat_title"]

        new_chat = ChatRoom(owner=owner, title=chatroom_title)
        new_chat.save()

        if members := data.get("members"):
            for member in members:
                memberObject = Player.objects.get(username=member)
                if memberObject != owner:
                    new_chat.members.add(memberObject)

        return Response(
            data={
                "roomid": new_chat.roomid
            },
            status=status.HTTP_201_CREATED
        )
