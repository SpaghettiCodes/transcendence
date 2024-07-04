from channels.generic.websocket import AsyncJsonWebsocketConsumer

from pong_server.server import PongServer

# note that a new consumer is made whenever a new connection is made
# the name of the new websocket used is called `self.channel_name`

class PongConsumer(AsyncJsonWebsocketConsumer):
    # called when client connects to websocket
    async def connect(self):
        self.gameid = self.scope['url_route']['kwargs']['pongid']
        self.player_name = None
        self.authorized = False

        await self.accept()
        await self.channel_layer.group_add(
            f"game-{self.gameid}", self.channel_name
        )

    # called when websocket connection closed
    async def disconnect(self, code):
        if self.gameid:
            await PongServer.player_left(self.player_name, self.gameid)
            await self.channel_layer.group_discard(
                f"game-{self.gameid}", self.channel_name
            )
        pass

    # called when server recieves a message from the client
    async def receive_json(self, content):
        if content.get('command'):
            command = content['command']
        else:
            if self.authorized:
                return PongServer.pass_info(content, self.gameid)
            return

        match command:
            case 'join':
                player_name = content['username']

                self.player_name = player_name

                result = await PongServer.join_player(self.player_name, self.gameid)
                if not result[0]:
                    await self.send_json({
                        'status': 'error',
                        'message': result[1]
                    })

                    return

                self.authorized = True
            case 'watch':
                player_name = content['username']

                self.player_name = player_name

                result = await PongServer.new_spectator(player_name, self.gameid)
                if not result[0]:
                    await self.send_json({
                        'status': 'error',
                        'message': result[1]
                    })
                    return

                self.authorized = True
            case _:
                await self.send_json({
                    'status': 'error',
                    'message': "Invalid Command"
                })

    async def message(self, event):
        try:
            if (self.authorized):
                await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])