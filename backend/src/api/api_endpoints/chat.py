from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseServerError, HttpResponseBadRequest

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from database.models import ChatRoom, Player, ChatMessage, InviteMessage, Match
from ..serializer import ChatRoomSerializer, ChatMessageSerializer

from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async, async_to_sync

from datetime import datetime

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
        chatMsgObj = ChatMessage.objects.filter(room=chatObj).order_by('-chatid') # get everything
    else:
        chatMsgObj = ChatMessage.objects.filter(
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

def createInvite(messageObject, match_type, ws_group_name):
    from pong_server.server import PongServer
    from pong_server.pong.pong import PongGame

    def customRemovalFunction(gameInstance: PongGame, InviteObject: InviteMessage):
        async def removalFunc():
            if not gameInstance.matchPlayed():
                InviteObject.match = None # remove match
                InviteObject.status = 3 # set to expired

            await PongServer.createRemovalFunction(gameInstance.gameid)()

            if gameInstance.matchPlayed():
                InviteObject.status = 2

            await InviteObject.asave()

            msgid = lambda : InviteObject.chatMessage.chatid

            await get_channel_layer().group_send(ws_group_name, {
                "type" : "message",
                "text" : {
                    "command": "update_match",
                    "chatid": await sync_to_async(msgid)(),
                    "status": InviteObject.get_status_display()
                }
            })
        return removalFunc

    newInviteObject = InviteMessage.objects.create(
        chatMessage=messageObject
    )

    gameId = PongServer.new_game(type=match_type, hidden=True)
    if gameId is None:
        # walau dunno how to type properly isit
        raise HttpResponseBadRequest()

    gameInstance = PongServer.getGameInstance(gameId)
    gameInstance.setRemovalFunction(customRemovalFunction(gameInstance, newInviteObject))
    gameObject = None

    try:
        gameObject = Match.objects.get(matchid=gameId)
    except ObjectDoesNotExist:
        # this is completely our fault
        newInviteObject.delete()
        raise HttpResponseServerError()

    newInviteObject.match = gameObject
    newInviteObject.save()
    return gameId

@api_view(["POST"])
def chatPostingMessages(request: Request, chat_id):
    data = request.data

    channel_layer = get_channel_layer()
    group_name = f"chat-{chat_id}"

    room = get_object_or_404(ChatRoom.objects, roomid=chat_id)
    owner = room.owner
    members = room.members.all()
    sender = get_object_or_404(Player.objects, username=data["sender"])

    if sender not in members and sender != owner:
        return Response(status=status.HTTP_403_FORBIDDEN)

    posted = datetime.now()
    content = data["message"]

    newMessage = ChatMessage(room=room, sender=sender, posted=posted, content=content)
    newMessage.save()
    if data['type'] == 'invite':
        newMessage.type = 2
        newMessage.save()
        gameid = createInvite(newMessage, data["match_type"], group_name)

    if data['type'] == 'message':
        async_to_sync ( channel_layer.group_send ) (group_name, {
            "type": "message",
            "text": {
                "command": "new_message",
                **data
            }
        })
    elif data['type'] == 'invite':
        async_to_sync ( channel_layer.group_send ) (group_name, {
            "type": "message",
            "text": {
                "command": "new_invite",
                "chatid": newMessage.chatid,
                "sender": data["sender"],
                "gameid": gameid,
                "status": "waiting"
            }
        })

    return Response(status=status.HTTP_200_OK)
