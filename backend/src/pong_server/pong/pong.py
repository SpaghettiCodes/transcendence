from ..common.components.ball import Ball
from ..common.components.paddle import Paddle
from ..common.components.gameframe import GameFrame

import asyncio

from datetime import datetime
import random

from ..base.game import Game

class PongGame(Game):
    def __init__(self, gameid, hidden=False, expectedPlayers=[]) -> None:
        super().__init__(gameid, hidden, expectedPlayers)

        self.field = GameFrame()

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

        self.resetField()

    def resetField(self):
        self.field.initialization()
        self.field.setPlayers(self.attackerid, self.defenderid)

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

    def initialState(self):
        from ..common.states.processPhysics import ProcessPhysics
        return ProcessPhysics(self)