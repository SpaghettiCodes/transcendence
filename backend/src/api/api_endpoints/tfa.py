from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework import status
from database.models import Player, TwoFactorAuthentication
from django.conf import settings
from django.core.mail import send_mail

@api_view(['POST'])
def send_tfa_code(request):
	data=request.data
	if 'username' not in data.keys():
		return Response(
			{"Error": "username not given"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	player_username = data.get('username')
	player = get_object_or_404(Player.objects, username=player_username)
	code_object = get_object_or_404(TwoFactorAuthentication.objects, player=player)
	code_object.generate_code()
	code = code_object.code
	player_email = player.email
	if player_email == "":
		return Response(
			{"Error": "the player doesnt have an email registered"},
			status=status.HTTP_400_BAD_REQUEST
		)

	subject = 'Welcome for pong'
	message = f'Hi {player_username}, this is your verification code: {code}'
	email_from = settings.EMAIL_HOST_USER
	recipient_list = [player_email]
	send_mail( subject, message, email_from, recipient_list )

@api_view(['POST'])
def verify_tfa_code(request):
	data=request.data
	if 'username' not in data.keys() or 'code' not in data.keys():
		return Response(
			{"Error": "username/code not given"},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	player_username = data.get('username')
	player = get_object_or_404(Player.objects, username=player_username)
	code_object = get_object_or_404(TwoFactorAuthentication.objects, player=player_username)
	
	if code_object.verify_code():
		return Response(
			{"Message": "Code verified"},
			status=status.HTTP_200_OK
		)
	else:
		return Response(
			{"Error": "Incorrect code"},
			status=status.HTTP_401_UNAUTHORIZED
		)

# {"username":"justyn"}