# depreciated, will remove in future revisions
# its here JUST IN CASE we need it

# from rest_framework_simplejwt.authentication import JWTAuthentication

# from django.conf import settings
# from django.shortcuts import redirect
# from database.models import Player
# from rest_framework.response import Response
# from rest_framework import status
# import re

# # https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej

# LOGIN_URL = '/api/player/login' # bro i think you forgot to set thisu

# PATH_401 = '/api/error/401'

# JWT_AUTH_EXEMPT_PARTIAL = [
#     '/admin/',
#     '/api/ft/',
# ]

# JWT_AUTH_EXEMPT_FULL = [
#     '/api/login',
#     '/api/register',
#     PATH_401
# ]

# class AuthenticateJWTMiddleware(JWTAuthentication):
#     user_model = Player

#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         response = self.get_response(request)
#         return response
    
#     def process_view(self, request, view_func, view_args, view_kwargs):
#         for exempt in JWT_AUTH_EXEMPT_PARTIAL:
#             if request.path.startswith(exempt):
#                 return None
#         for exempt in JWT_AUTH_EXEMPT_FULL:
#             if request.path == (exempt):
#                 return None
            
#         header = self.get_header(request)
        
#         try:
#             raw_token = self.get_raw_token(header)
#             print("authenticating... ")
#             post_jwt_auth = self.get_validated_token(raw_token)
#             try:
#                 user = self.get_user(post_jwt_auth)
#                 print("username: ", user)
#             except Exception as error:
#                 print(error)
#             request.META['username'] = user.username
#             # print(request.META)
#         except:
#             print("authentication failed")
#             return redirect(PATH_401)

#         return None

"""

{
"username":"e",
"password":"eee",
"email":"e@e.com"
}

"""