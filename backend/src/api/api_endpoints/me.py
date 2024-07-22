from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from rest_framework import status

from ..serializer import PlayerSerializer
from datetime import datetime

import asyncio

@api_view(['GET'])
def getMe(request: Request):
    me = request.user
    serializer = PlayerSerializer(me)
    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )