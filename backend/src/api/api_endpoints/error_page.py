from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample,  OpenApiParameter

@extend_schema(
		summary="nuh uh",
		description="Unauthorize people get redirected here",
		responses={401: None}
)
@api_view(['GET'])
def Return401(request):
	return Response(
            {"Error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )