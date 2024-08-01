from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tournament_server.manager import TournamentManager

from rest_framework_simplejwt.exceptions import InvalidToken

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
            await TournamentManager.player_left(self.playerObject, self.tournament_id)
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
                except Exception as e:
                    print(e)
                    self.send_json({
                        'status': 'auth_error'
                    })
                    return self.close()

                result, message, code = await TournamentManager.player_join(self.playerObject, self.tournament_id)
                if result:
                    self.authorized = True
                    await self.send_json({
                        "status": "refresh"
                    })
            case 'spectate':
                self.spectate = True
                return
            case _:
                if (self.authorized):
                    content = {
                        'player': self.playerObject,
                        **content
                    }
                    result, message, code = await TournamentManager.passInfo(self.tournament_id, content)
                else:
                    return

        if not result:
            await self.send_json({
                'status': 'error',
                'message': message
            })
            match code:
                case 'lost':
                    await self.send_json({
                        'status': 'loser'
                    })

    async def message(self, event):
        try:
            if (self.authorized or self.spectate):
                await self.send_json(event["text"])
        except Exception as e:
            print(e)