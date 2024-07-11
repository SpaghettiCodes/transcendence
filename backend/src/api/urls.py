from django.urls import path
from .api_endpoints import ft, game, player, matches, hello, chat, tournament

urlpatterns = [
    path('hello/', hello.hello_world),
    path('player/', player.ViewPlayers.as_view()),
    path('player/<player_username>', player.SpecificPlayer),
    path('player/<player_username>/match', player.SpecificPlayerMatches),
    path('player/<player_username>/chat', player.SpecificPlayerChats),
    path('game', game.GameView.as_view()),
    path('game/<game_id>', game.specificGameGet),
    path('match', matches.matchPost),
    path('match/<match_id>', matches.specificMatchGet),
    path('chat', chat.Chat.as_view()),
    path('chat/<chat_id>/history', chat.chatHistory),
    path('ft/auth', ft.get_ft_code),
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
    path('tournament/', tournament.TournamentView.as_view()),
    path('tournament/<tournament_id>', tournament.specificTournamentDetails),
    path('tournament/<tournament_id>/game/<game_id>', game.specificGameGet)
]