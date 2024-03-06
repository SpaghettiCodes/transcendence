from django.urls import path
from .api_endpoints import ft, player, playerid, matches, hello, list_match

urlpatterns = [
    path('hello/', hello.hello_world),
    path('player/', player.ViewPlayers.as_view()),
    path('player/<player_username>', playerid.SpecificPlayer),
    path('player/<player_username>/match', playerid.SpecificPlayerMatches),
    path('match', list_match.ViewPongMatches.as_view()),
    path('ft/auth', ft.get_ft_code),
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
]