from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.core.exceptions import FieldDoesNotExist

from database.models import Player, Friend_Request
from ..serializer import PlayerSerializer, PublicPlayerSerializer

class ViewFriends(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    """
    A wants to be friends with B

    A sends API to /api/B/friends

    B accepts

    B send API to /api/A/friends
    """

    # add friend // accept friend request
    def post(self, request: Request, player_username, format=None):
        try:
            sender_username = request.data.get('sender') # man i think i should put sender username in the url
        except FieldDoesNotExist:
            return Response(
                {"Error": "sender username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if sender_username == player_username:
            # y u try to be friends with urself
            return Response(
                {"Error": "you are already friends with yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        p_receiver = get_object_or_404(Player.objects, username=player_username)
        p_sender = get_object_or_404(Player.objects, username=sender_username)

        # check if receiver once sent a friend req to 
        existingFriendRequest = p_sender.friend_request_receiver.all().filter(sender=p_receiver)
        if existingFriendRequest.exists():
            existingFriendRequest = existingFriendRequest.get()
            existingFriendRequest.accept()
            return Response(status=status.HTTP_202_ACCEPTED)

        newFriendRequest = Friend_Request.objects.create(
            sender=p_sender,
            receiver=p_receiver
        )
        return Response(status=status.HTTP_201_CREATED)

    # get list of friends
    def get(self, request: Request, player_username, format=None):
        p = get_object_or_404(Player.objects, username=player_username)
        friends_obj = p.friends.all()
        serialized = PublicPlayerSerializer(friends_obj, many=True)
        return Response(serialized.data)

    """
    A wants to remove // reject B

    A sends DELETE api call to /api/B/friends
    """
    # remove friend // reject friend request
    def delete(self, request: Request, player_username, format=None):
        try:
            sender_username = request.data.get('sender') # man i think i should put sender username in the url
        except FieldDoesNotExist:
            return Response(
                {"Error": "sender username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if (sender_username == player_username):
            return Response(
                {"Error": "cant unfriend yourself"},
                status.HTTP_400_BAD_REQUEST
            )

        p_receiver = get_object_or_404(Player.objects, username=sender_username)
        p_sender = get_object_or_404(Player.objects, username=player_username)

        # reject the friend request
        existingFriendRequest = p_receiver.friend_request_receiver.all().filter(sender=p_sender)
        if existingFriendRequest.exists():
            existingFriendRequest = existingFriendRequest.get()
            existingFriendRequest.decline()

        p_receiver.remove_friend(p_sender)
        return Response(status=status.HTTP_200_OK)
