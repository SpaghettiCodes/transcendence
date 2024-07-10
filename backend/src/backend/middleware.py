from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

from django.conf import settings
from django.shortcuts import redirect
from rest_framework.response import Response
from rest_framework import status
import re

# https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej

JWT_AUTH_EXEMPT_PARTIAL = [
    '/admin/',
    '/api/ft/',
    '/api/player/create',
    '/api/player/login',
]

JWT_AUTH_EXEMPT_FULL = [
    '/api/player/',
]

LOGIN_URL = '/api/player/login'
PATH_401 = '/api/error/401'

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
            print(header)
            if header is None:
                # raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
                raw_token = request.headers.get('Authorization')
            else:
                raw_token = self.get_header('Authorization')
            token = re.search('b\'Bearer(.*)\'', raw_token)
            print("token: " + token)
            self.get_validated_token(token)
        except:
            # print("nope")
            return redirect(PATH_401)


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