from ..common.components.ball import Ball
from ..common.components.paddle import Paddle
from .gameframe import GameFrame

import asyncio

from datetime import datetime
import random

from ..base.game import Game

from database.models import Match, Player, MatchResult
from django.core.exceptions import ObjectDoesNotExist

class PongGame(Game):
    def __init__(self, gameid, removalFunction, subserver_id=None, hidden=False, expectedPlayers=[]) -> None:
        super().__init__(gameid, removalFunction, subserver_id, hidden, expectedPlayers)

        if len(expectedPlayers):
            assert len(expectedPlayers) == 2, "Expected Players MUST HAVE THE LENGTH OF 2"

        self.type = "pong"

        self.field = GameFrame()

        self.maxScore = 1 # PLEASE CHANGE LATER

        self.attackerid = None
        self.defenderid = None

    def getWinner(self):
        winner, loser = self.field.getWinnerLoser()
        if (self.forfeit):
            return self.getNotMissingPlayer()
        return winner

    def getMaxScore(self):
        return self.maxScore

    def canStart(self):
        # to start the game, you must have 2 players
        return len(self.players) == 2

    def initialization(self):
        # allow reconnection
        # deep copy
        if len(self.expectedPlayers) < 2:
            # only do this if expected players is less than 2 (i.e. 0)
            self.expectedPlayers = [x for x in self.players]
            # if we already have expected players, we know who is joining the server already

        # determine who left and who right
        random.shuffle(self.expectedPlayers)
        self.attackerid = self.expectedPlayers[0]
        self.defenderid = self.expectedPlayers[1]

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

    async def uploadMatchResults(self):
        matchObject = None
        attacker = None
        defender = None

        try:
            matchObject = await Match.objects.aget(matchid=self.gameid)
            matchObject.status = 2
            await matchObject.asave()
        except ObjectDoesNotExist:
            print("What, how")
            return

        try:
            attacker = await Player.objects.aget(username=self.attackerid)
            defender = await Player.objects.aget(username=self.defenderid)
        except ObjectDoesNotExist:
            print("Player does not exist, who were we playing against, ghosts?")
            await matchObject.adelete()
            return

        attacker_score = int(self.field.attackerScore)
        defender_score = int(self.field.defenderScore)

        winner, loser = self.field.getWinnerLoser()
        if self.isForfeit():
            winner = self.getNotMissingPlayer()

        if winner == self.attackerid:
            winner = attacker
            loser = defender
        else:
            winner = defender
            loser = attacker

        newResult = MatchResult(
            attacker=attacker, 
            defender=defender,
            attacker_score=attacker_score,
            defender_score=defender_score,
            winner=winner,
            loser=loser,
            match=matchObject
        )

        if self.isForfeit():
            newResult.reason = 2
        
        if attacker_score == defender_score:
            newResult.reason = 3

        self.resultsUploadSuccessfully = True
        await newResult.asave()


    def initialState(self):
        from ..common.states.processPhysics import ProcessPhysics
        from ..common.states.startingCountDown import startingCountDown

        return startingCountDown(ProcessPhysics(self), 5, self)

    def uploadScores(self):
        if not self.played:
            return
        print("Uploading Scores to Database...")