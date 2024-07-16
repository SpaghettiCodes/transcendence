from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .api_endpoints import ft, match, player, playerSpecific, friends, hello, chat, result, tournament, friend_reqs, error_page
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('hello', hello.hello_world),

    ## login n register
    path('login', player.login),
    path('register', player.createPlayer),

    ## players
    path('player', player.ViewPlayers.as_view()),
    path('player/<player_username>', playerSpecific.SpecificPlayer),
    path('player/<player_username>/match', player.SpecificPlayerMatches),
    path('player/<player_username>/chat', player.SpecificPlayerChats),

    ## friends post - make request, get - get list, delete - remove a friend
    path('player/<player_username>/friends', friends.ViewFriends.as_view()),

    # HEADS UP, accepting a friend reqeust just post to the target's friends api endpoint
    # we then check if the friend request exists, if it does, we accept it 
    # if it doesnt, we create one

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
    path('ft/me', ft.get_ft_me),
    path('ft/env', ft.get_ft_env),

    ## tournamnet
    path('tournament', tournament.TournamentView.as_view()),
    path('tournament/<tournament_id>', tournament.specificTournamentDetails),
    path('tournament/<tournament_id>/result', tournament.specificTournamentResults),
    path('tournament/<tournament_id>/match/<match_id>', match.specificMatchGet),

    ## jwt token
    # path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'), # fam we obtain the pair via /login
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify', TokenVerifyView.as_view(), name='token_verify'),

    ## thou are not authorized
    path('error/401', error_page.Return401),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
