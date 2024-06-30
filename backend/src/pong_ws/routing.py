from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("pong/<slug:pongid>", consumers.PongConsumer.as_asgi()),
]