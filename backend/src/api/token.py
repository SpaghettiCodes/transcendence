from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from database.models import Player

# User=get_user_model()

# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/getting_started.html
# https://www.youtube.com/watch?v=ax2AorU9PNc
def create_jwt_pair_for_user(user:Player):
    refresh = RefreshToken.for_user(user)
    tokens = {"access": str(refresh.access_token), "refresh": str(refresh)}

    return tokens

