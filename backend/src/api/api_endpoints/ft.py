from rest_framework.decorators import api_view, renderer_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework import status

import requests

import os

CLIENT_ID = os.environ.get("42API_UID")
CLIENT_SECRET = os.environ.get("42API_SECRET")
REDIRECT_URI = os.environ.get("42API_URI")
STATE = os.environ.get("42API_STATE")

# its joever
# Get cannot have body as data
# POST method but im actually sending data
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


@api_view(['POST'])
def get_ft_me(request):
    data = request.data
    code = data["code"]

    headers = {'Authorization': f'Bearer {code}'}
    response = requests.get("https://api.intra.42.fr/v2/me", headers=headers)

    if (response.status_code == 200):
        return Response(response.json())
    return Response(status=response.status_code)

@api_view(['GET'])
def get_ft_env(request):
    return Response({
        "clientuid": os.environ.get("42API_UID"),
        "redirecturi": os.environ.get("42API_URI"),
        "state": os.environ.get("42API_STATE")
    })