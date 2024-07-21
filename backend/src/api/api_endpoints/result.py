from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from database.models import Match
from ..serializer import MatchSerializer

class MatchResult(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def get(self, request: Request, match_id, format = None):
        matchDetails = get_object_or_404(Match, matchid=match_id)
        serialized = MatchSerializer(matchDetails)
        # serialized = MatchResultSerializer(matchDetails.result.get())
        return Response(serialized.data)