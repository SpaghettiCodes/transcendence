from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tournament_server.manager import TournamentManager

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope['url_route']['kwargs']['tournamentid']

        self.groupName = f"tournament-{self.tournament_id}" 
        self.playerName = None
        self.authorized = False
        self.spectate = False

        await self.accept()
        await self.channel_layer.group_add(
            self.groupName, self.channel_name
        )

    async def disconnect(self, code):
        if self.authorized:
            await TournamentManager.player_left(self.playerName, self.tournament_id)
        await self.channel_layer.group_discard(
            self.groupName, self.channel_name
        )

    async def receive_json(self, content):
        command = content.get("command")
        username = content.get("username")
        match command:
            case "join":
                result, message = await TournamentManager.player_join(username, self.tournament_id)
                if result:
                    self.playerName = username
                    self.authorized = True
                    await self.send_json({
                        "status": "refresh"
                    })
            case _:
                result, message = await TournamentManager.passInfo(self.tournament_id, content)
        
        if not result:
            await self.send_json({
                'status': 'error',
                'message': message
            })

    async def message(self, event):
        try:
            if (self.authorized or self.spectate):
                await self.send_json(event["text"])
        except Exception as e:
            print(e.args[0])