from abc import ABC, abstractmethod

from channels.layers import get_channel_layer

import asyncio
import json

from datetime import datetime

from ..base.state import State
from ..common.states.pause import Pause

class Game(ABC):
    FRAME_RATE = 1/60

    def __init__(self, gameid, removalFunction, subserver_id = None, hidden=False, expectedPlayers=[]) -> None:
        # initial positions and shit
        self.gameid = gameid

        if subserver_id:
            self.group_name = f"game-{subserver_id}-{gameid}"
        else:
            self.group_name = f"game-{gameid}"

        self.players = []
        self.spectator = []

        self.expectedPlayers = expectedPlayers
        self.hidden = hidden

        self.removalFunction = removalFunction

        self.played = False
        self.begin = False
        self.currentState = None
        self.channel_layer = get_channel_layer()

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

    def get_data(self):
        return {
            "game_id": self.gameid,
            "player_count": len(self.players),
            "spectator_count": len(self.spectator),
            "begin": self.begin,
            "players": self.expectedPlayers
        }

    async def playerLeft(self, username):
        if username in self.spectator:
            self.spectator.remove(username)
            # no one cares if a spectator leaves
            return

        if username not in self.players:
            return

        self.players.remove(username)

        await self.channel_layer.group_send(self.gameid, {
            "type": "message",
            "text": json.dumps({
                "status": "info",
                "message": f"player ${username} left",
            })
        })

        if self.emptyLobby():
            await self.removeFromServer()

    async def playerJoin(self, username):
        if not self.has_begin():
            if self.expectedPlayers and username not in self.expectedPlayers:
                return (False, "You arent Invited!")
        else:
            # allow reconnection
            if username not in self.expectedPlayers:
                return (False, "Ongoing Match!")

        # anyone that come here should be
        # 1. a new player
        # 2. a reconnected old player
        self.players.append(username)

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

    def spectatorJoin(self, username):
        self.spectator.append(username)
        return (True, "yep, all good")

    async def start(self):
        if not self.begin:
            self.played = True
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
