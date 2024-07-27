from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("tournament", consumers.TournamentListConsumer.as_asgi()),
]