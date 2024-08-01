from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from rest_framework.serializers import StringRelatedField
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample,  OpenApiParameter
from database.models import FourtyTwoAccount, Player
from backend.authentication import AuthenticateJWT

from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

from ..serializer import PlayerSerializer
from ..token import create_jwt_pair_for_user

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
    
    print(code)

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

class FourtyTwoAuth(APIView):
    parser_classes = [JSONParser]
    renderer_classes = [JSONRenderer]

    def post(self, request, format=None):
        ftAuthCode = request.data['ft_code']
        playerCode = request.data['player_code']

        headers = {'Authorization': f'Bearer {ftAuthCode}'}
        response = requests.get("https://api.intra.42.fr/v2/me", headers=headers)
        ft_data = response.json()

        intraID = ft_data['login']

        authObject = AuthenticateJWT()
        try:
            playerObject = authObject.get_user(authObject.get_validated_token(playerCode))
        except InvalidToken as e:
            return Response({'error': 'invalid player token'},
                            status=status.HTTP_400_BAD_REQUEST)
        except AuthenticationFailed as e:
            return Response({'error': 'authentication failed'},
                            status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(e)
            return Response({'error': 'the server has failed you'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            intraObject = FourtyTwoAccount.objects.get(intraID=intraID)
            intraObject.player = playerObject
        except ObjectDoesNotExist:
            intraObject = FourtyTwoAccount.objects.create(
                intraID=intraID,
                player=playerObject
            )

        return Response(status=status.HTTP_201_CREATED)

    def get(self, request, format=None):
        # we steal JWTAuthentication's header extraction
        authObject = AuthenticateJWT()

        try:
            fourtyTwoCode = authObject.get_raw_token(authObject.get_header(request))
        except AuthenticationFailed as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

        headers = {'Authorization': f'Bearer {fourtyTwoCode.decode('utf-8')}'} # pray that it works
        response = requests.get("https://api.intra.42.fr/v2/me", headers=headers)

        if (not response.ok):
            return Response(
                data=response.json(),
                status=response.status_code
            )

        ft_data = response.json()

        intraID = ft_data['login']
        intraIDObject = get_object_or_404(FourtyTwoAccount, intraID=intraID)
        playerObject = intraIDObject.player
        playerObject.now_online()
        data = create_jwt_pair_for_user(playerObject)
        return Response({
            'success': '42 Login Success',
            'data': data
        }, status=status.HTTP_200_OK)
