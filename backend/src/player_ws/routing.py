from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("player", consumers.PlayerNotification.as_asgi())
]