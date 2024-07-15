from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.core.exceptions import FieldDoesNotExist

from database.models import Player, Friend_Request
from ..serializer import PlayerSerializer

class ViewFriends(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # add friend // accept friend request
    def post(self, request: Request, player_username, format=None):
        try:
            sender_username = request.data.get('sender') # man i think i should put sender username in the url
        except FieldDoesNotExist:
            return Response(
                {"Error": "sender username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )

        p_me = get_object_or_404(Player.objects, username=player_username)
        p_sender = get_object_or_404(Player.objects, username=sender_username)

        # check if receiver once sent a friend req to 
        existingFriendRequest = p_sender.friend_request_receiver.all().filter(sender=p_me)
        if existingFriendRequest.exists():
            existingFriendRequest = existingFriendRequest.get()
            existingFriendRequest.accept()
            return Response(status=status.HTTP_202_ACCEPTED)

        newFriendRequest = Friend_Request.objects.create(
            sender=p_sender,
            receiver=p_me
        )
        return Response(status=status.HTTP_201_CREATED)

    # get list of friends
    def get(self, request: Request, player_username, format=None):
        p = get_object_or_404(Player.objects, username=player_username)
        friends_obj = p.friends.all()
        serialized = PlayerSerializer(friends_obj, many=True)
        return Response(serialized.data)

    # remove friend // reject friend request
    def delete(self, request: Request, player_username, format=None):
        try:
            sender_username = request.data.get('sender') # man i think i should put sender username in the url
        except FieldDoesNotExist:
            return Response(
                {"Error": "sender username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )

        p_me = get_object_or_404(Player.objects, username=player_username)
        p_sender = get_object_or_404(Player.objects, username=sender_username)

        # reject the friend request
        existingFriendRequest = p_me.friend_request_receiver.all().filter(sender=p_sender)
        if existingFriendRequest.exists():
            existingFriendRequest = existingFriendRequest.get()
            existingFriendRequest.decline()

        p_me.remove_friend(p_sender)
        return Response(status=status.HTTP_200_OK)