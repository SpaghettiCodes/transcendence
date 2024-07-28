from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .api_endpoints import friendRequest, ft, match, player, playerSpecific, friends, hello, chat, result, tournament, tfa, playerBlock, me
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('hello', hello.hello_world),

    ## login n register
    path('login', player.login),
    path('register', player.createPlayer),
	path('2fa/send', tfa.send_tfa_code),
	path('2fa/verify', tfa.verify_tfa_code),

    ## get my own details
    path('me', me.getMe),

    ## players
    path('player', player.ViewPlayers.as_view()),
    path('player/random', player.selectNRandomPlayers),
    path('player/<player_username>', playerSpecific.SpecificPlayer),
    path('player/<player_username>/match', playerSpecific.SpecificPlayerMatches),
    path('player/<player_username>/chat', playerSpecific.SpecificPlayerChats),

    ## friends 
    # get - get list of friends, delete - remove a friend
    path('player/<player_username>/friends', friends.ViewFriends.as_view()),
    # post - make request, get - get sent and received list, delete - remove a request
    path('player/<player_username>/friends/request', friendRequest.ViewFriendRequest.as_view()),

    # get direct chats
    path('player/<player_username>/chat/<player2_username>', friends.getDirectMessageChatRoom),

    ## blocking people
    path('player/<player_username>/blocked', playerBlock.ViewBlocked.as_view()),

    ## matches
    path('match', match.MatchView.as_view()),
    path('match/<match_id>', match.specificMatchGet),
    path('match/<match_id>/result', result.MatchResult.as_view()),

    ## chat system
    path('chat', chat.Chat.as_view()),
    path('chat/<chat_id>', chat.chatPostingMessages),
    path('chat/<chat_id>/history', chat.chatHistory),

    ## 42 login
    path('ft/auth', ft.get_ft_code),
    # path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),
    path('ft', ft.FourtyTwoAuth.as_view()),

    ## tournamnet
    path('tournament', tournament.TournamentView.as_view()),
    path('tournament/<tournament_id>', tournament.specificTournamentDetails),
    path('tournament/<tournament_id>/result', tournament.specificTournamentResults),

    ## jwt token
    # path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'), # fam we obtain the pair via /login
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify', TokenVerifyView.as_view(), name='token_verify'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
