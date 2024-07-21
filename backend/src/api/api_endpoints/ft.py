from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework import status

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample,  OpenApiParameter
from rest_framework.serializers import StringRelatedField

import requests

import os

CLIENT_ID = os.environ.get("42API_UID")
CLIENT_SECRET = os.environ.get("42API_SECRET")
REDIRECT_URI = os.environ.get("42API_URI")
STATE = os.environ.get("42API_STATE")

@extend_schema(
        summary='gets your 42 auth token',
        description="Gets your 42 auth token, which can be used to call 42 api, must first have the code gotten from 42 api (read up on how to do 42 API oAuth)",
        request=StringRelatedField,
        examples=[
            OpenApiExample("Example of Request", {
                "code": "your 42 client code... or something, check main branch -> ft_login.js on steps"
            })
        ],
        responses={401: None,
                   200: OpenApiResponse(
                       None, "the most important part returned here is your access token"
                   )}
)
@api_view(['POST'])
def get_ft_code(request):
    data = request.data
    try:
        code = data["code"]
    except KeyError:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    headers = {'content-type': 'multipart/form-data'}
    payload = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "state": STATE
    }
    # WHY IS IT A FORM DATA??????
    session = requests.Session()
    response = session.post("https://api.intra.42.fr/oauth/token", data=payload, headers=headers)

    if (response.status_code == 200):
        return Response(response.json())
    return Response(status=response.status_code)

@extend_schema(
        summary="Gets your 42 data",
        description="On your behalf, gets your data from 42 API, must first have the auth code gotten from /api/42/auth",
        request=StringRelatedField,
        examples=[
            OpenApiExample("Example of Request", {
                "code": "y0uR_42_@uTh_t0K3n",
            })
        ],
        responses=({401: None,
                    200: OpenApiResponse(None, "Frankly speaking, i also forgor, check 42 docs")})
)
@api_view(['POST'])
def get_ft_me(request):
    data = request.data
    code = data["code"]

    headers = {'Authorization': f'Bearer {code}'}
    response = requests.get("https://api.intra.42.fr/v2/me", headers=headers)

    if (response.status_code == 200):
        return Response(response.json())
    return Response(status=response.status_code)

@extend_schema(
        summary="Required data for 42 Authentication",
        description="Gets data required to do 42 API authentication",
        responses=({200: OpenApiResponse(
            StringRelatedField, "Data required to do 42 API authentication", [
                OpenApiExample("list of items returned", {
                "clientuid": "abcedfg",
                "redirecturi": "abcedfg",
                "state": "abcdefg"
                })
            ]
        )})
)
@api_view(['GET'])
def get_ft_env(request):
    return Response({
        "clientuid": os.environ.get("42API_UID"),
        "redirecturi": os.environ.get("42API_URI"),
        "state": os.environ.get("42API_STATE")
    })