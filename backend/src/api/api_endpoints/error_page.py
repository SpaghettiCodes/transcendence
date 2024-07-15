from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

def Return401(request):
	return Response(
            {"Error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )