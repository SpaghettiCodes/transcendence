from abc import ABC, abstractmethod

from channels.layers import get_channel_layer

import asyncio
import json

from datetime import datetime

class Game:
    def __init__(self, gameid, hidden=False, expectedPlayers=None) -> None:
        # initial positions and shit
        self.gameid = gameid
        self.players = []
        self.spectator = []

        self.expectedPlayers = expectedPlayers
        self.hidden = hidden

        self.begin = False
        self.pause = False
        self.channel_layer = get_channel_layer()

    def emptyLobby(self):
        return not len(self.players)

    def is_restricted(self):
        return len(self.expectedPlayers)

    def is_hidden(self):
        return self.hidden

    def has_begin(self):
        return self.begin

    def paused(self):
        return self.pause

    def get_data(self):
        return {
            "game_id": self.gameid,
            "player_count": len(self.players),
            "spectator_count": len(self.spectator)
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

        if self.has_begin():
            self.pause = True

    async def playerJoin(self, username):
        if not self.has_begin():
            if self.expectedPlayers and username not in self.expectedPlayers:
                return (False, "You arent Invited!")
        else:
            # allow reconnection
            if username not in self.expectedPlayers:
                return (False, "Ongoing Match!")

        self.players.append(username)

        if not self.has_begin():
            if self.canStart():
                await self.start()
            else:
                await self.channel_layer.group_send(self.gameid, {
                    "type": "message",
                    "text": {
                        "status": "wait"
                    }
                })
        else:
            if self.canStart():
                self.pause = False

        return (True, "nothing to see here, move along")

    def spectatorJoin(self, username):
        self.spectator.append(username)
        return (True, "yep, all good")

    async def start(self):
        if not self.begin:
            await self.channel_layer.group_send(self.gameid, {
                "type": "message",
                "text": {
                    "status": "start"
                }
            })

            self.begin = True
            self.loop_start = asyncio.create_task(self.loop()) # thanks wallace

    async def stop(self):
        if self.begin:
            self.begin = False
            asyncio.gather(self.loop_start)

    @abstractmethod
    def canStart(self):
        pass

    @abstractmethod
    def command(self, json_info):
        pass

    @abstractmethod
    async def loop(self):
        pass
