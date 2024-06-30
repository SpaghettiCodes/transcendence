from .components.ball import Ball
from .components.paddle import Paddle
from .components.gameframe import GameFrame

import asyncio

from datetime import datetime
import random

from ..base.game import Game

class PongGame(Game):
    def __init__(self, gameid, hidden=False, expectedPlayers=[]) -> None:
        super().__init__(gameid, hidden, expectedPlayers)

        self.gameid = f"game-{self.gameid}"

        self.attacker = Paddle()
        self.defender = Paddle()
        self.ball = Ball()

        self.field = GameFrame(
            ball=self.ball,
            attacker=self.attacker,
            defender=self.defender
        )

        self.attackerid = None
        self.defenderid = None

    def canStart(self):
        # to start the game, you must have 2 players
        return len(self.players) == 2

    def initialization(self):
        # allow reconnection
        # deep copy
        self.expectedPlayers = [x for x in self.players]

        # determine who left and who right
        random.shuffle(self.players)
        self.attackerid = self.players[0]
        self.defenderid = self.players[1]

    def command(self, json_info):
        target = json_info['username']

        if target == self.attackerid:
            affected_paddle = self.field.getAttackerPaddle()
        elif target == self.defenderid:
            affected_paddle = self.field.getDefenderPaddle()
        else:
            return

        action = json_info['action']
        match (action):
            case 'go_up':
                affected_paddle.set_velocity(0, -1) # oh yes how could i forgot, 0 0 is at the top right corner
            case 'go_down':
                affected_paddle.set_velocity(0, 1)
            case 'stop':
                affected_paddle.set_velocity(0, 0)

    async def loop(self):
        self.initialization()
        self.field.initialization()

        while self.begin:
            await asyncio.sleep(float(1/60))
            if not self.pause:
                self.field.renderFrame(float(1/60))
                data = self.field.getFrame()

                await self.channel_layer.group_send(self.gameid, {
                    "type": "message",
                    "text": data
                })
            else:
                await self.channel_layer.group_send(self.gameid, {
                    "type": "message",
                    "text": {
                        "status": "pause"
                    }
                })
                
