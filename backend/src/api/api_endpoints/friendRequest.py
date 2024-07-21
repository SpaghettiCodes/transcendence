from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework import status

from database.models import Player, Friend_Request
from ..serializer import PlayerSerializer, FriendRequestSerializer

from django.core.exceptions import FieldDoesNotExist
from django.core.files.images import ImageFile

class ViewFriendRequest(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    # list received and sent friend request
    def get(self, request, player_username, format=None):
        data = request.data
        user = get_object_or_404(Player, username=player_username)

        listOfRequestSent = user.friend_request_sender.all()
        listOfRequestReceived = user.friend_request_receiver.all()

        return Response({
            "sent": FriendRequestSerializer(listOfRequestSent, many=True).data,
            "received": FriendRequestSerializer(listOfRequestReceived, many=True).data
        })

    # add a friend request
    # adds a friend if a request with both target is found
    def post(self, request, player_username, format=None):
        sender_username = request.data.get('sender') # man i think i should put sender username in the url

        if sender_username is None:
            return Response(
                {"error": "target username not given"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if player_username == sender_username:
            # y u try to be friends with urself
            return Response(
                {"error": "you are already friends with yourself"},
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

    # decline a request
    def delete(self, request, player_username, format=None):
        try:
            sender_username = request.data.get('sender')
        except FieldDoesNotExist:
            return Response(
                {"error": "sender username not give"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        p_receiver = get_object_or_404(Player.objects, username=player_username)
        p_sender = get_object_or_404(Player.objects, username=sender_username)

        # reject the friend request
        existingFriendRequest = p_receiver.friend_request_receiver.all().filter(sender=p_sender)
        if existingFriendRequest.exists():
            existingFriendRequest = existingFriendRequest.get()
            existingFriendRequest.decline()

        return Response(status=status.HTTP_200_OK)