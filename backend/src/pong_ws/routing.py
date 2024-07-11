from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("game/<slug:pongid>", consumers.PongConsumer.as_asgi()),
    path("tournament/<slug:tournamentid>/game/<slug:pongid>", consumers.PongConsumer.as_asgi())
]