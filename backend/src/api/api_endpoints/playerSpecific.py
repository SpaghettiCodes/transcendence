from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from database.models import Player, Friend_Request, Match
from ..serializer import PlayerSerializer, MatchSerializer, FriendRequestSerializer, PublicChatRoomSerializer, ModifiableFieldsPlayer

from django.core.exceptions import FieldDoesNotExist
from django.core.files.images import ImageFile
from django.db.models import Q

from passlib.exc import PasswordSizeError

import os

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample,  OpenApiParameter

def getSpecificPlayer(request: Request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    serialized = PlayerSerializer(p)
    return Response(serialized.data)

def removeSpecificPlayer(request: Request, player_username):
    requester_username = request.user.username
    if (requester_username != player_username):
        # AYE, WHAT U DOING HOMIE?
        return Response(status=status.HTTP_403_FORBIDDEN)

    p = get_object_or_404(Player.objects, username=player_username)
    p.delete()
    return Response(status=status.HTTP_200_OK)

def editSpecificPlayer(request, player_username):
    requester_username = request.user.username
    if (requester_username != player_username):
        # dont help other people edit
        return Response(status=status.HTTP_403_FORBIDDEN)

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

    data = request.data
    print(data)
    if 'password' in data.keys():
        raw_password = data.get('password')
        try:
            data['password'] = Player.encrypt_password(raw_password)
        except PasswordSizeError:
            return Response(
                {'error': "Password is too long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if 'profile_pic' in request.FILES:
        profile_pic = ImageFile(request.FILES['profile_pic'])
        profile_pic.name = f"player-pfp/player-{username}/{request.FILES['profile_pic'].name}"
        request.data['profile_pic'] = profile_pic

    serializer = ModifiableFieldsPlayer(player, data=data, partial=True)

    if serializer.is_valid():
        print(request.user.profile_pic)
        serializer.save()
        print(player.profile_pic)
        print(request.user.profile_pic)
    else:
        print(serializer.errors)
        errors = {}
        for aspect, errorList in serializer.errors.items():
            errors[aspect] = [str(error).capitalize() for error in errorList]
        print(errors)
        return Response(
            errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(serializer.data)

@api_view(['DELETE', 'GET', 'PATCH'])
def SpecificPlayer(request, player_username):
    match request.method:
        case 'DELETE':
            return removeSpecificPlayer(request, player_username)
        case 'GET':
            return getSpecificPlayer(request, player_username)
        case 'PATCH':
            return editSpecificPlayer(request, player_username)

@api_view(['GET'])
@extend_schema(
    summary="Gets a specific player's match history",
    responses={404: None, 401: None,
               200: OpenApiResponse(
                   MatchSerializer(many=True), "List of Matches the player participated in"
               )}
)
def SpecificPlayerMatches(request, player_username):
    p = get_object_or_404(Player.objects, username=player_username)
    m = Match.objects.filter(Q(result__attacker=p) | Q(result__defender=p))
    m = m.order_by("-time_played")
    serialized = MatchSerializer(m, many=True)
    return Response(serialized.data)

@extend_schema(
    summary="Gets chatrooms where the user is part of",
    responses={404: None, 401: None,
               200: OpenApiResponse(PublicChatRoomSerializer(), "List of chatroom the user is in",
                                    [
                                        OpenApiExample("Example of list of chatroom the player is in", [
                                            {
                                                "roomid": 0,
                                                "memberNo": 1,
                                            },
                                            {
                                                "roomid": 1,
                                                "memberNo": 2,
                                            },
                                            {
                                                "roomid": 4,
                                                "memberNo": 5,
                                            },
                                        ])
                                    ]
                                    )}
)
@api_view(['GET'])
def SpecificPlayerChats(request, player_username):
    requester_username = request.user.username
    if (requester_username != player_username):
        # no need you snooping around
        return Response(status=status.HTTP_403_FORBIDDEN)

    p = get_object_or_404(Player.objects, username=player_username)
    c = (p.members.all() | p.owner.all()).distinct()
    serialized = PublicChatRoomSerializer(c, many=True)
    return Response(serialized.data)
