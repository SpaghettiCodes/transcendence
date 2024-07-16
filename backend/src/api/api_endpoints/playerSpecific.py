from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from database.models import Player, Friend_Request
from ..serializer import PlayerSerializer, MatchSerializer, FriendRequestSerializer

from django.core.exceptions import FieldDoesNotExist
from django.core.files.images import ImageFile

def getSpecificPlayer(player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    serialized = PlayerSerializer(p)
    return Response(serialized.data)

def removeSpecificPlayer(player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    p.delete()
    return Response(status=status.HTTP_200_OK)

def editSpecificPlayer(request, player_username):
    username = player_username
    if username is None:
        return Response({"Error": "'username' must be included in query"},
                status=status.HTTP_400_BAD_REQUEST)
    player = get_object_or_404(Player.objects, username=player_username)

    for field in request.data.keys():
        try:
            Player._meta.get_field(field)
        except FieldDoesNotExist:
            return Response(
                {"Error": f"Field '{field}' does not exist in player model"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    data=request.data
    if 'password' in data.keys():
        raw_password = data.get('password')
        data['password'] = Player.encrypt_password(raw_password)
    serializer = PlayerSerializer(player, data=data, partial=True)
    
    if 'profile_pic' in request.FILES:
        profile_pic = ImageFile(request.FILES['profile_pic'])
        profile_pic.name = request.FILES['profile_pic'].name
        request.data['profile_pic'] = profile_pic

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
        return Response(
            {"Error": "Failed to update player"},
            status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.data)

@api_view(['DELETE', 'GET', 'PATCH'])
def SpecificPlayer(request, player_username):
    match request.method:
        case 'DELETE':
            return removeSpecificPlayer(player_username)
        case 'GET':
            return getSpecificPlayer(player_username)
        case 'PATCH':
            return editSpecificPlayer(request, player_username)

@api_view(['GET'])
def SpecificPlayerMatches(request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    m = p.attacker.all() | p.defender.all()
    m = m.order_by("time_played")
    serialized = MatchSerializer(m, many=True)
    return Response(serialized.data)

@api_view(['GET'])
def DisplayFriends(request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    friends_obj = p.friends.all()
    serialized = PlayerSerializer(friends_obj, many=True)
    return Response(serialized.data)

@api_view(['GET'])
def DisplayFriendRequests(request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    fr_list = FriendRequestSerializer(
        Friend_Request.objects.filter(receiver=p.id), many=True)
    return Response(fr_list.data)

@api_view(['POST'])
def AcceptFriendRequest(request, player_username):
    try:
        sender_username = request.data.get('sender') # man i think i should put sender username in the url
    except FieldDoesNotExist:
        return Response(
            {"Error": "sender username not given"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        p_me = get_object_or_404(Player.objects, username=player_username)
        p_sender = get_object_or_404(Player.objects, username=sender_username)
        fr = Friend_Request.objects.get(sender=p_sender.id, receiver=p_me.id)
        fr.accept()
        return Response(status=status.HTTP_200_OK)
    except:
        return Response(
            {"Error": "failed to accept friend request"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def DeclineFriendRequest(request, player_username):
    try:
        sender_username = request.data.get('sender') # man i think i should put sender username in the url
    except FieldDoesNotExist:
        return Response(
            {"Error": "sender username not given"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        p_me = get_object_or_404(Player.objects, username=player_username)
        p_sender = get_object_or_404(Player.objects, username=sender_username)
        fr = Friend_Request.objects.get(sender=p_sender.id, receiver=p_me.id)
        fr.decline()
        return Response(status=status.HTTP_200_OK)
    except:
        return Response(
            {"Error": "failed to decline friend request"},
            status=status.HTTP_400_BAD_REQUEST
        )