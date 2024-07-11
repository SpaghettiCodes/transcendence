from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("tournament/<slug:tournamentid>", consumers.TournamentConsumer.as_asgi())
]