from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .api_endpoints import ft, match, player, hello, chat, result, tournament, friend_reqs, error_page
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('hello', hello.hello_world),
    path('player', player.ViewPlayers.as_view()),
	path('player/create', player.createPlayer),
	path('player/login', player.login),
    path('player/<player_username>', player.SpecificPlayer),
	path('player/<player_username>/friends', playerid.DisplayFriends),
	path('player/<player_username>/friends/requests', playerid.DisplayFriendRequests),
	path('player/<player_username>/friends/accept', playerid.AcceptFriendRequest),
	path('player/<player_username>/friends/decline', playerid.DeclineFriendRequest),
    path('player/<player_username>/match', player.SpecificPlayerMatches),
	path('friends/requests', friend_reqs.DisplayAllFriendRequest),
	path('friends/make', friend_reqs.MakeFriendRequest),
    path('player/<player_username>/chat', player.SpecificPlayerChats),
    path('match', match.MatchView.as_view()),
    path('match/<match_id>', match.specificMatchGet),
    path('match/<match_id>/result', result.MatchResult.as_view()),
    path('chat', chat.Chat.as_view()),
    path('chat/<chat_id>', chat.chatPostingMessages),
    path('chat/<chat_id>/history', chat.chatHistory),
    path('ft/auth', ft.get_ft_code),
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
    path('tournament', tournament.TournamentView.as_view()),
    path('tournament/<tournament_id>', tournament.specificTournamentDetails),
    path('tournament/<tournament_id>/result', tournament.specificTournamentResults),
    path('tournament/<tournament_id>/match/<match_id>', match.specificMatchGet)
	path('error/401', error_page.Return401),
	path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
