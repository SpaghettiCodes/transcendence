from .ball import Ball
from .paddle import Paddle
from .gameframe import GameFrame

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import threading
import asyncio
import json

from datetime import datetime
import random

class PongGame:
    def __init__(self, gameid) -> None:
        # initial positions and shit
        self.gameid = gameid
        self.spectator = []

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

        self.begin = False

        self.init_positions()
        self.channel_layer = get_channel_layer()

    def get_data(self):
        return {
            "game_id": self.gameid,
            "player_count": (self.attackerid != None) + (self.defenderid != None),
            "spectator_count": len(self.spectator)
        }

    def ready(self):
        return self.attackerid and self.defenderid

    def init_positions(self):
        self.attacker.set_coord(20, 125)
        self.defender.set_coord(720, 125)
        self.ball.set_coord(375, 175)

        x_rand, y_rand = (0, 0)
        while ((not x_rand) and (not y_rand)):
            x_rand = (random.random() * 2) - 1
            y_rand = (random.random() * 2) - 1
        self.ball.set_velocity(x_rand, y_rand)

    async def playerLeft(self, username):
        if username in self.spectator:
            self.spectator.remove(username)
            return False

        if self.attackerid == username:
            self.attackerid = None
        elif self.defenderid == username:
            self.defenderid = None
        else:
            return False

        await self.channel_layer.group_send(self.gameid, {
            "type": "message",
            "text": json.dumps({
                "status": "end",
                "message": "one of the player left",
            })
        })

        return (not self.attackerid) and (not self.defenderid)

    async def playerJoin(self, username):
        if not self.attackerid:
            self.attackerid = username
        elif not self.defenderid:
            self.defenderid = username
        else:
            return (False, "Match is Full!")

        print(f"Player {username} joined")
        if self.attackerid and self.defenderid:
            await self.start()
        else:
            await self.channel_layer.group_send(self.gameid, {
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

    def command(self, json_info):
        target = json_info['username']

        if target == self.attackerid:
            affected_paddle = self.attacker
        elif target == self.defenderid:
            affected_paddle = self.defender
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

    def getFrame(self):
        attacker_cord = self.attacker.get_coord()
        defender_cord = self.defender.get_coord()
        ball_cord = self.ball.get_coord()

        return {
            "status": "update",
            "ballx": ball_cord[0],
            "bally": ball_cord[1],
            "attackerx": attacker_cord[0],
            "attackery": attacker_cord[1],
            "defenderx": defender_cord[0],
            "defendery": defender_cord[1]
        }

    def renderFrame(self, delta):
        self.attacker.move_Component(delta, 150)
        self.defender.move_Component(delta, 150)
        self.ball.move_Component(delta, 200)
        self.field.ball_logic()
        self.field.paddle_logic()

    async def loop(self):
        while self.begin:
            await asyncio.sleep(float(1/30))
            self.renderFrame(float(1/30))
            data = self.getFrame()

            await self.channel_layer.group_send(self.gameid, {
                "type": "message",
                "text": data
            })
