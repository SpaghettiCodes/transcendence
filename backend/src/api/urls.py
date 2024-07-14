from django.urls import path
from .api_endpoints import ft, match, player, hello, chat, result, tournament

urlpatterns = [
    path('hello', hello.hello_world),
    path('player', player.ViewPlayers.as_view()),
    path('player/<player_username>', player.SpecificPlayer),
    path('player/<player_username>/match', player.SpecificPlayerMatches),
    path('player/<player_username>/chat', player.SpecificPlayerChats),
    path('match', match.MatchView.as_view()),
    path('match/<match_id>', match.specificMatchGet),
    path('match/<match_id>/result', result.MatchResult.as_view()),
    path('chat', chat.Chat.as_view()),
    path('chat/<chat_id>/history', chat.chatHistory),
    path('ft/auth', ft.get_ft_code),
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
    path('tournament', tournament.TournamentView.as_view()),
    path('tournament/<tournament_id>', tournament.specificTournamentDetails),
    path('tournament/<tournament_id>/result', tournament.specificTournamentResults),
    path('tournament/<tournament_id>/match/<match_id>', match.specificMatchGet)
]
