"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from pong_ws.routing import websocket_urlpatterns as pong_ws_url
from match_list_ws.routing import websocket_urlpatterns as match_url
from chat_ws.routing import websocket_urlpatterns as chat_ws_url
from tournament_ws.routing import websocket_urlpatterns as tournament_ws_url

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(pong_ws_url + match_url + chat_ws_url + tournament_ws_url)
            )
        )
})