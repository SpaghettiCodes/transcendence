from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("chat/<roomid>", consumers.ChatConsumer.as_asgi()),
]