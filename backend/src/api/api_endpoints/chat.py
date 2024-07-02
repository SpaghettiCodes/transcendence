from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from database.models import ChatRoom, Player, ChatMessages
from ..serializer import ChatRoomSerializer, ChatMessageSerializer

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

@api_view(['GET'])
def chatHistory(request: Request, chat_id):
    last_msgId = request.GET.get('start_id')
    chatObj = ChatRoom.objects.get(roomid=chat_id)
    if (not last_msgId):
        chatMsgObj = ChatMessages.objects.filter(room=chatObj).order_by('-chatid') # get everything
    else:
        chatMsgObj = ChatMessages.objects.filter(
            room=chatObj,
            chatid__lt=last_msgId
        ).order_by('-chatid') # get everything AFTER the last message id

    # grab the 10 latest messages
    chatMsgObj = chatMsgObj[:10]
    if (chatMsgObj.exists()):
        serialized = ChatMessageSerializer(chatMsgObj, many=True)
        return Response(data={"history": serialized.data})
    else:
        return Response(data={"history": []})
