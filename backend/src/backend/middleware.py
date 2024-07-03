from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

from django.conf import settings
from django.shortcuts import redirect
import re

# https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej

JWT_AUTH_EXEMPT_PARTIAL = [
	'/admin/',
    '/api/player/create',
    '/api/player/login',
]

JWT_AUTH_EXEMPT_FULL = [
	'/api/player/',
]

LOGIN_URL = '/api/player/login'

class AuthenticateJWTMiddleware(JWTAuthentication):
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
        
        try:
            if header is None:
                raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
            else:
                raw_token = self.get_raw_token(header)
            # if raw_token is None:
            #     return None
            self.get_validated_token(raw_token)
        except:
            print("ww")


        # 
        # enforce_csrf(request)
        # return self.get_user(validated_token), validated_token
        return None

"""

{
"username":"e",
"password":"eee",
"email":"e@e.com"
}

"""