from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .api_endpoints import ft, player, playerid, matches, hello, list_match, friend_reqs

urlpatterns = [
    path('hello/', hello.hello_world),
    path('player/', player.ViewPlayers.as_view()),
	path('player/create', player.createPlayer),
	path('player/login', player.login),
    path('player/<player_username>', playerid.SpecificPlayer),
	path('player/<player_username>/friends', playerid.DisplayFriends),
	path('player/<player_username>/friends/requests', playerid.DisplayFriendRequests),
	path('player/<player_username>/friends/accept', playerid.AcceptFriendRequest),
	path('player/<player_username>/friends/decline', playerid.DeclineFriendRequest),
    path('player/<player_username>/match', playerid.SpecificPlayerMatches),
	path('friends/requests', friend_reqs.DisplayAllFriendRequest),
	path('friends/make', friend_reqs.MakeFriendRequest),
    path('match', list_match.ViewPongMatches.as_view()),
    path('ft/auth', ft.get_ft_code),
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)