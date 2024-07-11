from ..common.components.ball import Ball
from .components.vent import Vent
from ..pong.gameframe import GameFrame as PongGameFrame

import random
from datetime import datetime

class GameFrame(PongGameFrame):
    def __init__(self, width=750, height=350) -> None:
        super().__init__(width, height)

        self.lastMadeFakeBall = datetime.now()

        # please change this later, i just need it to test
        self.coolDownSec = 10
        self.fakeBallChance = 100
        self.fakeBallMax = 100

        self.fakeBalls: list[Ball] = []

        # testing purposes
        self.ventWidths = 100

        ventA = Vent(None, self.ventWidths, 75, 20)
        ventB = Vent(ventA, self.ventWidths, 500, 320)
        ventA.setExit(ventB)
        self.vents = [ventA, ventB]

    def getDetails(self):
        something = super().getDetails()
        return {
            **something,
            "vent": {
                "width": self.ventWidths
            }
        }

    def renderFrame(self, delta):
        super().renderFrame(delta)

        if (len(self.fakeBalls) < self.fakeBallMax and self.canMakeFakeBall()):
            self.generateFakeBall()

        for fakeBall in self.fakeBalls:
            fakeBall.move_Component(delta)
            self.ball_collided_with_wall(fakeBall)

        balls = [self.ball] + self.fakeBalls

        for ball in balls:
            for vent in self.vents:
                vent.ball_within_boundary(ball)

    def canMakeFakeBall(self):
        currentTime = datetime.now()
        difference = currentTime - self.lastMadeFakeBall
        if (difference.seconds >= self.coolDownSec):
            return True
        return False

    def generateFakeBall(self):
        x, y = self.ball.get_coord()
        if (random.random() < (self.fakeBallChance / 100)):
            newFakeBall = Ball(x, y, self.ballRadius, self.ballSpeed)
            newFakeBall.random_velocity(0, 90)
            self.fakeBalls.append(newFakeBall)

        self.lastMadeFakeBall = datetime.now()

    def initialization(self):
        super().initialization()
        self.fakeBalls.clear()

    def getFrame(self):
        attacker_cord = self.attacker.get_json_coord()
        defender_cord = self.defender.get_json_coord()
        ball_cord = self.ball.get_json_coord()

        ballCoordinates = [ball_cord] + [fakeBall.get_json_coord() for fakeBall in self.fakeBalls]
        # have fun figuring out which is the real ball MUAHAHAHAHA
        random.shuffle(ballCoordinates)

        return {
            "status": "update",
            "balls": ballCoordinates,
            "vents": [vent.get_json_coord() for vent in self.vents],
            "attacker": {
                "id": self.attackerId,
                **attacker_cord
            },
            "defender": {
                "id": self.defenderId,
                **defender_cord
            }
        }
