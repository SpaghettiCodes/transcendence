from channels.generic.websocket import AsyncJsonWebsocketConsumer

from pong_server.server import PongServer

from backend.authentication import AuthenticateJWT

from asgiref.sync import sync_to_async

# note that a new consumer is made whenever a new connection is made
# the name of the new websocket used is called `self.channel_name`

class PongConsumer(AsyncJsonWebsocketConsumer):
    authenticator = AuthenticateJWT()

    # called when client connects to websocket
    async def connect(self):
        self.gameid = self.scope['url_route']['kwargs']['pongid']
        self.subserverid = self.scope['url_route']['kwargs'].get('tournamentid')

        self.groupname = f"game-{self.gameid}" # gameid is guranteed to be unique

        self.playerObject = None
        self.authenticator = PongConsumer.authenticator

        self.authorized = False
        self.spectate = False

        await self.accept()
        await self.channel_layer.group_add(
            self.groupname, self.channel_name
        )

    # called when websocket connection closed
    async def disconnect(self, code):
        if self.authorized or self.spectate:
            playerUsername = self.playerObject.username
            await PongServer.player_left(playerUsername, self.gameid, self.subserverid)
        await self.channel_layer.group_discard(
            self.groupname, self.channel_name
        )

    # called when server recieves a message from the client
    async def receive_json(self, content):
        if content.get('command'):
            command = content['command']
            playerJWT = content['jwt']
            validated_token = self.authenticator.get_validated_token(playerJWT)
            self.playerObject = await sync_to_async(self.authenticator.get_user)(validated_token)
            player_name = self.playerObject.username

            match command:
                case 'join':
                    result = await PongServer.join_player(player_name, self.gameid, self.subserverid)
                    if not result[0]:
                        await self.send_json({
                            'status': 'error',
                            'message': result[1]
                        })
                        self.close()

                        return

                    self.authorized = True
                case 'watch':
                    result = await PongServer.new_spectator(player_name, self.gameid, self.subserverid)
                    if not result[0]:
                        await self.send_json({
                            'status': 'error',
                            'message': result[1]
                        })
                        return

                    self.spectate = True
                case _:
                    await self.send_json({
                        'status': 'error',
                        'message': "Invalid Command"
                    })

        else:
            content = {
                'username': self.playerObject.username,
                **content
            }
            if self.authorized:
                PongServer.pass_info(content, self.gameid, self.subserverid)
            return

    async def message(self, event):
        try:
            if (self.authorized or self.spectate):
                await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])