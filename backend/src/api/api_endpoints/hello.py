from rest_framework.decorators import api_view
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

from ..serializer import ChatRoomSerializer
from rest_framework import serializers

@extend_schema(
    summary="Hello World!",
    description="First API created in this project, does nothing and returns a Hello World!\n Is also the place i test out swagger functionalities",
    responses={200: OpenApiResponse(serializers.CharField, "Hello World!", [
        OpenApiExample("Response", {
            "message": "Hello, World!"
        })
    ])},
    methods=['GET']
)
@api_view(['GET'])
def hello_world(request):
    return Response({
        'message': "Hello, World!",
    })
