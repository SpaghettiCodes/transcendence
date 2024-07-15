from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from database.models import Player, Friend_Request
from ..serializer import PlayerSerializer, FriendRequestSerializer

from django.core.exceptions import FieldDoesNotExist
from django.core.files.images import ImageFile

# debugging purposes, remove later
@api_view(['GET'])
def DisplayAllFriendRequest(request):
    fr_all = FriendRequestSerializer(Friend_Request.objects.all(), many=True)
    return Response(fr_all.data)

@api_view(['POST'])
def MakeFriendRequest(request):
    data = request.data
    try:
        sender_username = data.get('sender')
        receiver_username = data.get('receiver')
    except FieldDoesNotExist:
        return Response(
            {"Error": "sender/receiver username not given"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    sender = get_object_or_404(Player.objects, username=sender_username)
    receiver = get_object_or_404(Player.objects, username=receiver_username)

    try:
        friendrequest = Friend_Request.objects.create(sender_id=sender.id, receiver_id=receiver.id)
        return Response(status=status.HTTP_200_OK)
    except:
        return Response(
            {"Error": "Failed to create friend request"},
            status=status.HTTP_400_BAD_REQUEST
            )

"""

{
"sender":"1",
"receiver":"11"
}

{
"sender":"1"
}

"""