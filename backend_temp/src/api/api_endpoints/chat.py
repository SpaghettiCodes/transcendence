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
from ..serializer import ChatMessageSerializer, ChatRoomSerializer, ChatRoomIDSerializer

from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async, async_to_sync

from datetime import datetime

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample,  OpenApiParameter

class Chat(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    @extend_schema(
        summary="Create a new ChatRoom",
        description="This API endpoint is used to create a new ChatRoom",
        request=ChatRoomSerializer,
        examples=[
            OpenApiExample("Create a new chat room with no members", {
                    "username": "owner_username",
                    "title": "title_of_chatRoom"
            }, request_only=True), OpenApiExample("Create a new chatroom with a few members", {
                "username": "owner_username",
                "title": "title_of_chatRoom",
                "members": [
                    "member_1",
                    "member_2",
                    "member_3"
                ]
            }, request_only=True)
        ],
        responses={
            201: OpenApiResponse(ChatRoomIDSerializer, "ID of newly created Chatroom"),
            404: None
        },
        methods=['POST']
    )
    def post(self, request: Request, format = None):
        data = request.data

        owner_username = data["username"]
        owner = get_object_or_404(Player, username=owner_username)
        chatroom_title = data["title"]

        new_chat = ChatRoom(owner=owner, title=chatroom_title)
        new_chat.save()

        if members := data.get("members"):
            for member in members:
                memberObject = Player.objects.get(username=member)
                if memberObject != owner:
                    new_chat.members.add(memberObject)
        new_chat.save()

        serializer = ChatRoomIDSerializer(new_chat)
        return Response(
            data=serializer.data,
            status=status.HTTP_201_CREATED
        )

@extend_schema(
    summary="Gets the past messages of a ChatRoom",
    description="This API endpoint gets the last 10 message, starting from the messageid given in the query string variable start_id. If start_id is not give, it returns the 10 latest message from the chatroom",
    parameters=[
        OpenApiParameter(
            name="chat_id", 
            description="The Chatroom's id", 
            location='path'),
        OpenApiParameter(
            name="start_id",
            description="The id of the message to start getting from",
            location='query')
        ],
    methods=['GET'],
    responses={
        201: OpenApiResponse(
            # ChatMessageSerializer(), 
            "The 10 latest messages, starting from {start_id}, sorted from earliest message to later messages",
            [OpenApiExample("Example of list of message given, below are the 4 possible messages that can be sent, contact backend guys if we are missing examples", [
                {
                    "chatid": 4,
                    "type": "message",
                    "posted": "2024-07-16T11:34:44.548Z",
                    "sender": {
                        "username": "sender_username",
                    },
                    "content": "content of messege sent",
                },
                {
                    "chatid": 3,
                    "type": "invite",
                    "posted": "2024-07-12T11:34:44.548Z",
                    "sender": {
                        "username": "sender_username",
                    },
                    "content": "content of messege sent",
                    "invite_details": {
                        "status": 'done',
                        "match": 'match_id'
                    }
                },
                {
                    "chatid": 2,
                    "type": "invite",
                    "posted": "2024-07-10T11:34:44.548Z",
                    "sender": {
                        "username": "sender_username",
                    },
                    "content": "content of messege sent",
                    "invite_details": {
                        "status": 'waiting',
                        "match": 'match_id'
                    }
                },
                {
                    "chatid": 1,
                    "type": "invite",
                    "posted": "2024-07-09T11:34:44.548Z",
                    "sender": {
                        "username": "sender_username",
                    },
                    "content": "content of messege sent",
                    "invite_details": {
                        "status": 'expired',
                    }
                },
            ])
        ]),
        401: None
    }
)
@api_view(['GET'])
def chatHistory(request: Request, chat_id):
    last_msgId = request.GET.get('start_id')
    maxMsgCount = 10 # change this later

    # TEMP, PLEASE REMEMBER TO REMOVE, WE ARE NOT PUTTING PEOPLE ID IN URLS
    username = request.GET.get('user')

    userObj = get_object_or_404(Player, username=username)
    chatObj = get_object_or_404(ChatRoom, roomid=chat_id)

    if (userObj not in chatObj.members.all() and userObj != chatObj.owner):
        return Response(status=status.HTTP_403_FORBIDDEN)

    if (not last_msgId):
        chatMsgObj = ChatMessage.objects.filter(room=chatObj).order_by('-chatid') # get everything
    else:
        chatMsgObj = ChatMessage.objects.filter(
            room=chatObj,
            chatid__lt=last_msgId
        ).order_by('-chatid') # get everything AFTER the last message id

    # grab the {maxMsgCount} latest messages
    firstFewMsg = chatMsgObj[:maxMsgCount]
    remainder = chatMsgObj[maxMsgCount:]
    serialized = ChatMessageSerializer(
        playerObject=userObj,
        instance=firstFewMsg,
        many=True
    )
    return Response(data={"history": serialized.data, 'haveMore': remainder.exists()})

def createInvite(messageObject, match_type, ws_group_name):
    from pong_server.server import PongServer
    from pong_server.pong.pong import PongGame

    def customRemovalFunction(gameInstance: PongGame, InviteObject: InviteMessage):
        async def removalFunc():
            await PongServer.createRemovalFunction(gameInstance.gameid)()

            InviteObject.status = 2
            if not gameInstance.matchPlayed() or not gameInstance.resultsUploadSuccessfully:
                InviteObject.match = None # remove match
                InviteObject.status = 3 # set to expired

            await InviteObject.asave()

            msgid = lambda : InviteObject.chatMessage.chatid

            await get_channel_layer().group_send(ws_group_name, {
                "type" : "message",
                "text" : {
                    "command": "update_match",
                    "chatid": await sync_to_async(msgid)(),
                    "status": InviteObject.get_status_display(),
                    'matchid': gameInstance.gameid
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

    content = data["message"]

    newMessage = ChatMessage(room=room, sender=sender, content=content)
    newMessage.save()
    if data['type'] == 'invite':
        newMessage.type = 2
        newMessage.save()
        createInvite(newMessage, data["match_type"], group_name)

    async_to_sync ( channel_layer.group_send ) (group_name, {
        "type": "message",
        "text": {
            "command": "new_message",
            'messageId': newMessage.chatid
        }
    })

    return Response(status=status.HTTP_200_OK)
