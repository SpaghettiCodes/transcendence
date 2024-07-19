from channels.generic.websocket import AsyncJsonWebsocketConsumer

from pong_server.server import PongServer

# note that a new consumer is made whenever a new connection is made
# the name of the new websocket used is called `self.channel_name`

class PongConsumer(AsyncJsonWebsocketConsumer):
    # called when client connects to websocket
    async def connect(self):
        self.gameid = self.scope['url_route']['kwargs']['pongid']
        self.subserverid = self.scope['url_route']['kwargs'].get('tournamentid')

        self.groupname = f"game-{self.gameid}" # gameid is guranteed to be unique

        self.player_name = None
        self.authorized = False
        self.spectate = False

        await self.accept()
        await self.channel_layer.group_add(
            self.groupname, self.channel_name
        )

    # called when websocket connection closed
    async def disconnect(self, code):
        if self.authorized or self.spectate:
            await PongServer.player_left(self.player_name, self.gameid, self.subserverid)
        await self.channel_layer.group_discard(
            self.groupname, self.channel_name
        )

    # called when server recieves a message from the client
    async def receive_json(self, content):
        if content.get('command'):
            command = content['command']
        else:
            if self.authorized:
                PongServer.pass_info(content, self.gameid, self.subserverid)
            return

        match command:
            case 'join':
                self.player_name = content['username']

                result = await PongServer.join_player(self.player_name, self.gameid, self.subserverid)
                if not result[0]:
                    await self.send_json({
                        'status': 'error',
                        'message': result[1]
                    })
                    self.close()

                    return

                self.authorized = True
            case 'watch':
                self.player_name = content['username']

                result = await PongServer.new_spectator(self.player_name, self.gameid, self.subserverid)
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

    async def message(self, event):
        try:
            if (self.authorized or self.spectate):
                await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])