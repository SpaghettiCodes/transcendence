from channels.generic.websocket import AsyncJsonWebsocketConsumer

from pong_server.server import PongServer

# note that a new consumer is made whenever a new connection is made
# the name of the new websocket used is called `self.channel_name`

match_list_newsletter = "match_list_newsletter"

class ListMatchConsumer(AsyncJsonWebsocketConsumer):
    # called when client connects to websocket
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add(
            match_list_newsletter, self.channel_name
        )
        await self.send_json(PongServer.get_servers_list())

    # called when websocket connection closed
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            match_list_newsletter, self.channel_name
        )

    # called when server recieves a message from the client
    async def receive_json(self, content):
        if content.get('command'):
            command = content['command']
        else:
            return

        match command:
            case 'list':
                await self.send_json(PongServer.get_servers_list())

    # temp
    # will make one that only sends what to change
    # then frontend probably parses it
    @classmethod
    async def update(cls):
        await cls.channel_layer.group_send(match_list_newsletter, {
            "type": "message",
            "text": PongServer.get_servers_list()
        })

    async def message(self, event):
        try:
            await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])()