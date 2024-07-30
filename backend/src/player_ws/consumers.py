from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tournament_server.manager import TournamentManager
from rest_framework_simplejwt.exceptions import InvalidToken

from backend.authentication import AuthenticateJWT

from asgiref.sync import sync_to_async

class PlayerNotification(AsyncJsonWebsocketConsumer):
    authenticator = AuthenticateJWT()

    @classmethod
    def generateGroupName(cls, playerUsername):
        return f"notification-player-{playerUsername}"

    async def connect(self):
        self.groupName = None

        self.playerObject = None
        self.authenticator = PlayerNotification.authenticator

        self.authorized = False

        await self.accept()

    async def disconnect(self, code):
        if (self.groupName is not None):
            await self.channel_layer.group_discard(
                self.groupName, self.channel_name
            )

    async def receive_json(self, content):
        command = content.get("command")

        match command:
            case "join":
                playerJWT = content.get('jwt')

                print(playerJWT)
                validated_token = self.authenticator.get_validated_token(playerJWT)
                try:
                    self.playerObject = await sync_to_async(self.authenticator.get_user)(validated_token)
                except InvalidToken as e:
                    print('n.g.')
                    print(e)
                    self.close()
                username = self.playerObject.username
                self.groupName = PlayerNotification.generateGroupName(username)
                await self.channel_layer.group_add(
                    self.groupName, self.channel_name
                )
                self.authorized = True

    async def message(self, event):
        try:
            if (self.authorized):
                await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])
