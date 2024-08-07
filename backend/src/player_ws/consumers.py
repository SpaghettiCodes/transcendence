from channels.generic.websocket import AsyncJsonWebsocketConsumer

from backend.authentication import AuthenticateJWT

from asgiref.sync import sync_to_async

from channels.layers import get_channel_layer
from database.models import Player

class PlayerNotification(AsyncJsonWebsocketConsumer):
    authenticator = AuthenticateJWT()

    @classmethod
    async def sendToPlayerNoti(cls, playerUsername, data):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(cls.generateGroupName(playerUsername), {
            'type': 'message',
            'text': data
        })

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
        if (self.playerObject is not None):
            # get the updated version of the player object
            playerObj = await Player.objects.aget(username=self.playerObject.username)
            await sync_to_async(playerObj.now_offline)()

        if (self.groupName is not None):
            await self.channel_layer.group_discard(
                self.groupName, self.channel_name
            )

    async def receive_json(self, content):
        command = content.get("command")

        match command:
            case "join":
                playerJWT = content.get('jwt')

                try:
                    validated_token = self.authenticator.get_validated_token(playerJWT)
                    self.playerObject = await sync_to_async(self.authenticator.get_user)(validated_token)
                    await sync_to_async(self.playerObject.now_online)()
                except Exception as e:
                    print(e)
                    await self.send_json({
                        'status': 'auth_error'
                    })
                    return await self.close()

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
            print(e)
