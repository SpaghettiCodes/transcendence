from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("match/<slug:pongid>", consumers.PongConsumer.as_asgi()),
]