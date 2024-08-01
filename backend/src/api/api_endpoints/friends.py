from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.core.exceptions import FieldDoesNotExist

from database.models import Player, ChatRoom
from ..serializer import PublicPlayerSerializer, PublicChatRoomSerializer

class ViewFriends(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # get list of friends
    def get(self, request: Request, player_username, format=None):
        p = get_object_or_404(Player.objects, username=player_username)
        friends_obj = p.friends.all()
        serialized = PublicPlayerSerializer(friends_obj, many=True)
        return Response(serialized.data)

    # remove friend
    def delete(self, request: Request, player_username, format=None):
        requester_username = request.user.username
        # dont go breaking friendships
        if (player_username != requester_username):
            return Response(status=status.HTTP_403_FORBIDDEN)

        try:
            target_username = request.data.get('target')
        except FieldDoesNotExist:
            return Response(
                {"Error": "sender username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (target_username == player_username):
            return Response(
                {"Error": "cant unfriend yourself"},
                status.HTTP_400_BAD_REQUEST
            )

        p_target = get_object_or_404(Player.objects, username=target_username)
        p_player = get_object_or_404(Player.objects, username=player_username)

        p_player.remove_friend(p_target)
        return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
def getDirectMessageChatRoom(request: Request, player_username, player2_username):
    if player_username == player2_username:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    sender = request.user

    p1 = get_object_or_404(Player, username=player_username)
    p2 = get_object_or_404(Player, username=player2_username)

    if (sender != p1 and sender != p2):
        # nope, not giving it to you
        return Response(status=status.HTTP_403_FORBIDDEN)

    memberSet = [p1, p2]
    chatrooms = ChatRoom.objects.annotate(
        members_count=Count('members', filter=Q(members__in=memberSet))
    ).filter(
        members_count=2
    )

    if (not chatrooms.exists()):
        chatroom = ChatRoom.objects.create(
            title="Direct Message",
        )
        chatroom.members.add(*memberSet)
    else:
        chatroom = chatrooms.get()

    serializer = PublicChatRoomSerializer(chatroom)
    return Response(serializer.data)