from rest_framework_simplejwt.authentication import JWTAuthentication

from django.conf import settings
from django.shortcuts import redirect
from database.models import Player
from django.http import JsonResponse
from rest_framework import status
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from .authentication import JWT_AUTH_EXEMPT_FULL, JWT_AUTH_EXEMPT_PARTIAL
import re

# https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej

PATH_401 = '/api/error/401'

class AuthenticateJWTMiddleware(JWTAuthentication):
    user_model = Player

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        for exempt in JWT_AUTH_EXEMPT_PARTIAL:
            if request.path.startswith(exempt):
                return None
        for exempt in JWT_AUTH_EXEMPT_FULL:
            if request.path == (exempt):
                return None

        header = self.get_header(request)
        if header is None:
            return JsonResponse({'error': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return JsonResponse({'error': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

            post_jwt_auth = self.get_validated_token(raw_token)

            self.get_user(post_jwt_auth)
        except InvalidToken as e:
            return JsonResponse({'error': 'invalid jwt token'}, status=status.HTTP_401_UNAUTHORIZED)
        except AuthenticationFailed as e:
            if (e.get_full_details()['code']['message'] == 'user_not_found'):
                return JsonResponse({'error': 'user associated to this token not found'}, status=status.HTTP_404_NOT_FOUND)
            return JsonResponse({'error': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        except:
            return JsonResponse({'error': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        return None
