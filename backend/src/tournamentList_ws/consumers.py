from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tournament_server.manager import TournamentManager

# note that a new consumer is made whenever a new connection is made
# the name of the new websocket used is called `self.channel_name`

tournament_list_newslatter = "tournament_list_newsletter"

# NOTE - WILL BE DEPRECIATED IN FUTURE PUSHES DUE TO SEEING NO USAGE

class TournamentListConsumer(AsyncJsonWebsocketConsumer):
    # called when client connects to websocket
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add(
            tournament_list_newslatter, self.channel_name
        )
        await self.send_json(TournamentManager.get_server_list())

    # called when websocket connection closed
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            tournament_list_newslatter, self.channel_name
        )

    # called when server recieves a message from the client
    async def receive_json(self, content):
        if content.get('command'):
            command = content['command']
        else:
            return

        match command:
            case 'list':
                await self.send_json(TournamentManager.get_servers_list())

    async def message(self, event):
        try:
            await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])()