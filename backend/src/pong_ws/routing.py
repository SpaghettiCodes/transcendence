from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("pong", consumers.PongConsumer.as_asgi()),
]