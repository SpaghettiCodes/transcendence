from django.urls import path
from .api_endpoints import ft, matchmaking, player, matches, hello, chat

urlpatterns = [
    path('hello/', hello.hello_world),
    path('player/', player.ViewPlayers.as_view()),
    path('player/<player_username>', player.SpecificPlayer),
    path('player/<player_username>/match', player.SpecificPlayerMatches),
    path('player/<player_username>/chat', player.SpecificPlayerChats),
    path('matchmaking/create', matchmaking.createNewGame),
    path('matchmaking/match', matchmaking.matchmake),
    path('chat', chat.Chat.as_view()),
    path('ft/auth', ft.get_ft_code),
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
]