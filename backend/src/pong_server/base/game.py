from abc import ABC, abstractmethod

from channels.layers import get_channel_layer

import asyncio
import json

from ..base.state import State
from api.serializer import PlayerSerializer

from datetime import datetime

class Game(ABC):
    FRAME_RATE = 1/240

    def __init__(self, gameid, removalFunction, hidden=False, expectedPlayers=[]) -> None:
        # initial positions and shit
        self.gameid = gameid
        
        self.group_name = f"game-{gameid}" # game id is guranteed to be unique

        self.players = []
        self.spectator = []

        self.expectedPlayers = expectedPlayers
        self.hidden = hidden

        self.removalFunction = removalFunction

        self.played = False
        self.begin = False
        self.currentState = None
        self.forfeit = False
        self.channel_layer = get_channel_layer()

        self.type = None
        self.resultsUploadSuccessfully = False

        self.ended = False

    def setPlayed(self):
        self.played = True

    def getType(self):
        return self.type

    async def startImmediately(self):
        await self.start()

    def setRemovalFunction(self, newRemovalFunction):
        self.removalFunction = newRemovalFunction

    async def removeFromServer(self):
        await self.stop()
        await self.removalFunction()

    def emptyLobby(self):
        return not len(self.players)

    def is_restricted(self):
        return len(self.expectedPlayers)

    def is_hidden(self):
        return self.hidden

    def has_begin(self):
        return self.begin

    def set_ended(self):
        self.ended = True

    def matchPlayed(self):
        return self.played

    def get_data(self):
        return {
            "game_id": self.gameid,
            "player_count": len(self.players),
            "spectator_count": len(self.spectator),
            "begin": self.begin,
            'ended': self.ended,
            "players": [ player.username for player in self.expectedPlayers ],
        }

    # grace period for removing the server 
    # before we delete the entire game server
    async def delayAndRemove(self, duration=3):
        startTime = datetime.now()
        totalDuration = duration
        durationLeft = totalDuration

        while (durationLeft > 0.25):
            currentTime = datetime.now()
            difference = (currentTime - startTime).total_seconds()
            durationLeft = max(0, totalDuration - difference)

            if len(self.players):
                return

            await asyncio.sleep(0.1)

        await self.removeFromServer()

    async def playerLeft(self, playerObject):
        if playerObject in self.spectator:
            self.spectator.remove(playerObject)
            # no one cares if a spectator leaves
            return

        if playerObject not in self.players:
            return

        if (playerObject in self.players):
            self.players.remove(playerObject)

        await self.channel_layer.group_send(self.gameid, {
            "type": "message",
            "text": json.dumps({
                "status": "info",
                "message": f"player ${playerObject.username} left",
            })
        })

        if self.emptyLobby():
            await self.delayAndRemove()

    async def playerJoin(self, playerObject):
        if not self.has_begin():
            if self.expectedPlayers and playerObject not in self.expectedPlayers:
                return (False, "You arent Invited!")
        else:
            # allow reconnection
            if playerObject not in self.expectedPlayers:
                return (False, "Ongoing Match!")

        if (playerObject in self.players):
            return (True, "Uhhhh dont worry about it i guess")

        # anyone that come here should be
        # 1. a new player
        # 2. a reconnected old player
        self.players.append(playerObject)

        if not self.has_begin():
            if self.canStart():
                await self.start()
            else:
                await self.channel_layer.group_send(self.group_name, {
                    "type": "message",
                    "text": {
                        "status": "wait"
                    }
                })

        return (True, "nothing to see here, move along")

    def spectatorJoin(self, playerObject):
        self.spectator.append(playerObject)
        return (True, "yep, all good")

    async def start(self):
        if not self.begin:
            await self.channel_layer.group_send(self.group_name, {
                "type": "message",
                "text": {
                    "status": "start"
                }
            })

            self.begin = True
            self.currentState = self.initialState()
            self.loop_start = asyncio.create_task(self.loop()) # thanks wallace

    async def stop(self):
        if self.begin:
            self.begin = False
            asyncio.gather(self.loop_start)

    @abstractmethod
    def uploadScores(self):
        pass

    @abstractmethod
    def canStart(self):
        pass

    @abstractmethod
    def command(self, json_info):
        pass

    @abstractmethod
    def getDetails(self):
        pass

    @abstractmethod
    async def loop(self):
        pass

    @abstractmethod
    def initialization(self):
        pass

    @abstractmethod
    def initialState(self):
        pass

    @abstractmethod
    async def uploadMatchResults(self):
        pass

    @abstractmethod
    def incrementWinCount(self, playerObject):
        pass

    @abstractmethod
    def incrementGameCount(self, playerObject):
        pass

    @abstractmethod
    def incrementLostCount(self, playerObject):
        pass

    @abstractmethod
    def getWinner(self):
        pass

    def setForfeit(self):
        self.forfeit = True

    def isForfeit(self):
        return self.forfeit

    def getNotMissingPlayer(self):
        notMissingPlayer = [player for player in self.expectedPlayers if player in self.players]
        print(notMissingPlayer)
        return notMissingPlayer[0]

    def getMissingPlayer(self):
        missingPlayer = [player for player in self.expectedPlayers if player not in self.players]
        print(missingPlayer)
        return missingPlayer[0]

    async def loop(self):
        self.initialization()
        self.currentState: State = self.initialState()

        while self.begin:
            await asyncio.sleep(float(self.FRAME_RATE))

            forcedTransition, nextTransition = self.currentState.forceTransition()
            if (forcedTransition):
                self.currentState = nextTransition
            elif self.currentState.stateEnded():
                self.currentState = self.currentState.nextState()
            else:
                await self.currentState.runState()
                data = self.currentState.getData()

                await self.channel_layer.group_send(self.group_name, {
                    "type": "message",
                    "text": data
                })
