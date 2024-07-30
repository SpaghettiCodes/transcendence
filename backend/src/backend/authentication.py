from typing import Tuple
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from django.utils.translation import gettext_lazy as _
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
    '/api/2fa/',
]

JWT_AUTH_EXEMPT_FULL = [
    '/api/login',
    '/api/register',
    '/api/error/401',
    '/api/ft'
]

class AuthenticateJWT(JWTAuthentication):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.user_model = Player

    def authenticate(self, request: Request):
        print('auth for ---')
        print(request.path)
        for exempt in JWT_AUTH_EXEMPT_PARTIAL:
            if request.path.startswith(exempt):
                return None

        for exempt in JWT_AUTH_EXEMPT_FULL:
            if request.path == (exempt):
                return None

        header = self.get_header(request)
        if header is None:
            # haha nonono
            raise AuthenticationFailed(
                _('Authentication Header Not Provided'),
                code='no_auth_header'
            )

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            raise AuthenticationFailed(
                _('Authentication Header Not Provided'),
                code='no_auth_header'
            )

        return super().authenticate(request)
