from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from ..serializer import PlayerSerializer

import asyncio

@api_view(['GET'])
def getMe(request: Request):
    me = request.user
    serializer = PlayerSerializer(me)
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )