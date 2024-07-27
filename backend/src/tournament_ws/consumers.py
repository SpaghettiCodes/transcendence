from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tournament_server.manager import TournamentManager

from backend.authentication import AuthenticateJWT

from asgiref.sync import sync_to_async

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    authenticator = AuthenticateJWT()

    async def connect(self):
        self.tournament_id = self.scope['url_route']['kwargs']['tournamentid']

        self.groupName = f"tournament-{self.tournament_id}" 

        self.playerObject = None
        self.authenticator = TournamentConsumer.authenticator

        self.authorized = False
        self.spectate = False

        await self.accept()
        await self.channel_layer.group_add(
            self.groupName, self.channel_name
        )

    async def disconnect(self, code):
        if self.authorized:
            playerUsername = self.playerObject.username
            await TournamentManager.player_left(playerUsername, self.tournament_id)
        await self.channel_layer.group_discard(
            self.groupName, self.channel_name
        )

    async def receive_json(self, content):
        command = content.get("command")
        playerJWT = content.get('jwt')
        validated_token = self.authenticator.get_validated_token(playerJWT)
        self.playerObject = await sync_to_async(self.authenticator.get_user)(validated_token)
        username = self.playerObject.username
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
                content = {
                    'username': username,
                    **content
                }
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