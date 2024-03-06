from channels.generic.websocket import AsyncJsonWebsocketConsumer

from pong_server.server import PongServer

# note that a new consumer is made whenever a new connection is made
# the name of the new websocket used is called `self.channel_name`

class PongConsumer(AsyncJsonWebsocketConsumer):
    # called when client connects to websocket
    async def connect(self):
        self.gameid = None
        await self.accept()

    # called when websocket connection closed
    async def disconnect(self, code):
        if self.gameid:
            await PongServer.player_left(self.player_name, self.gameid)
            await self.channel_layer.group_discard(
                self.gameid, self.channel_name
            )
        pass

    # called when server recieves a message from the client
    async def receive_json(self, content):
        if content.get('command'):
            command = content['command']
        else:
            return PongServer.pass_info(content)

        match command:
            case 'play':
                player_name = content['username']
                gameid = PongServer.new_player(player_name)

                self.gameid = gameid
                self.player_name = player_name

                await self.channel_layer.group_add(
                    self.gameid, self.channel_name
                )

                await self.send_json({
                    'status': "joined",
                    'gameid': gameid
                })

            case 'join':
                player_name = content['username']
                gameid = content['gameid']

                self.player_name = player_name

                await self.channel_layer.group_add(
                    gameid, self.channel_name
                )
                result = await PongServer.join_player(player_name, gameid)
                if not result[0]:
                    await self.send_json({
                        'status': 'error',
                        'message': result[1]
                    })

                    await self.channel_layer.group_discard(
                        gameid, self.channel_name
                    )

                    return

                self.gameid = gameid

            case 'watch':
                player_name = content['username']
                gameid = content['gameid']

                self.player_name = player_name

                await self.channel_layer.group_add(
                    gameid, self.channel_name
                )

                result = await PongServer.new_spectator(player_name, gameid)
                if not result[0]:
                    await self.send_json({
                        'status': 'error',
                        'message': result[1]
                    })

                    await self.channel_layer.group_discard(
                        gameid, self.channel_name
                    )

                    return

                self.gameid = gameid

            case _:
                await self.send_json({
                    "message": "invalid command"
                })

    async def message(self, event):
        try:
            await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])