from ..common.components.ball import Ball
from ..common.components.paddle import Paddle
from .gameframe import GameFrame

import asyncio

from datetime import datetime
import random

from ..base.game import Game

class PongGame(Game):

    def __init__(self, gameid, removalFunction, subserver_id=None, hidden=False, expectedPlayers=...) -> None:
        super().__init__(gameid, removalFunction, subserver_id, hidden, expectedPlayers)

        self.type = "pong"

        self.field = GameFrame()

        self.maxScore = 1

        self.attackerid = None
        self.defenderid = None

    def getMaxScore(self):
        return self.maxScore

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

    def getDetails(self):
        return {
            "players": self.players,
            "spectators": self.spectator,
            "started": self.begin,
            "sides": {
                "attacker": self.attackerid,
                "defender": self.defenderid
            },
            "score": self.field.getJsonScore(),
            "settings": self.field.getDetails()
        }

    def getResults(self):
        if not self.played:
            return {
                "id": self.gameid,
                "played": self.played,
                "reason": "Welp, gotta save why now"
            }
        else:
            winner, loser = self.field.getWinnerLoser()
            return {
                "id": self.gameid,
                "played": self.played,
                "sides": {
                    "attacker": self.attackerid,
                    "defender": self.defenderid
                },
                "score": self.field.getJsonScore(),
                "winner": winner,
                "loser": loser
            }

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

    def uploadScores(self):
        if not self.played:
            return
        print("Uploading Scores to Database...")