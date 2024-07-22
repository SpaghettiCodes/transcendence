from typing import Tuple
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.conf import settings
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import Token
from database.models import Player
from rest_framework.response import Response
from rest_framework import status
import re

# https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej

JWT_AUTH_EXEMPT_PARTIAL = [
    '/admin/',
    '/api/ft/',
    '/api/token/',
]

JWT_AUTH_EXEMPT_FULL = [
    '/api/login',
    '/api/register',
    '/api/error/401',
]

class AuthenticateJWT(JWTAuthentication):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.user_model = Player

    def authenticate(self, request: Request):
        for exempt in JWT_AUTH_EXEMPT_PARTIAL:
            if request.path.startswith(exempt):
                return None

        for exempt in JWT_AUTH_EXEMPT_FULL:
            if request.path == (exempt):
                return None

        return super().authenticate(request)
