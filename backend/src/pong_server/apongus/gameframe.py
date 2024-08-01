from ..common.components.ball import Ball
from .components.vent import Vent
from ..pong.gameframe import GameFrame as PongGameFrame

import random
from datetime import datetime

class GameFrame(PongGameFrame):
    # by default, this has a 15:7 aspect ratio
    def __init__(self, width=750, height=350) -> None:
        super().__init__(width, height)

        self.realBallColor = self.ball.getColorValue()

        self.startTimeFrame = None

        # TODO: please change this later, i just need it to test
        self.coolDownSec = 5
        self.fakeBallChance = 100
        self.fakeBallMax = 10

        self.fakeBalls: list[Ball] = []

        # testing purposes

        # aspect ratio so the vent 
        # doesnt look weird - 1.311
        self.ventWidths = 52.44
        self.ventHeights = 40

        self.ventYOffset = 20
        self.ventXOffset = 150

        ventA = Vent(
            None, 
            self.ventWidths, 
            self.ventHeights, 
            self.ventXOffset, 
            self.ventYOffset
        )
        ventB = Vent(
            ventA,
            self.ventWidths,
            self.ventHeights,
            self.width - self.ventWidths - self.ventXOffset,
            self.height - self.ventHeights - self.ventYOffset
        )
        ventA.setExit(ventB)
        self.vents = [ventA, ventB]

    def getDetails(self):
        something = super().getDetails()
        return {
            **something,
            "vent": {
                "width": self.ventWidths,
                'height': self.ventHeights
            }
        }

    def renderFrame(self, delta):
        super().renderFrame(delta)

        if (not self.startTimeFrame):
            self.startTimeFrame = datetime.now()
        else:
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
        difference = currentTime - self.startTimeFrame
        if (difference.seconds >= self.coolDownSec):
            return True
        return False

    def generateFakeBall(self):
        x, y = self.ball.get_coord()
        if (random.random() < (self.fakeBallChance / 100)):
            newFakeBall = Ball(x, y, self.ballRadius, self.ballSpeed, len(self.fakeBalls) + 1 + self.realBallColor)
            newFakeBall.random_velocity(0, 90)
            self.fakeBalls.append(newFakeBall)

        self.startTimeFrame = None

    def initialization(self):
        super().initialization()
        self.startTimeFrame = None
        self.fakeBalls.clear()

    def getFrame(self):
        attacker_cord = self.attacker.get_json_coord()
        defender_cord = self.defender.get_json_coord()
        ball_cord = self.ball.get_json_coord()

        ballCoordinates = [ball_cord] + [fakeBall.get_json_coord() for fakeBall in self.fakeBalls]

        return {
            "status": "update",
            "balls": ballCoordinates,
            "vents": [vent.get_json_coord() for vent in self.vents],
            "attacker": attacker_cord,
            "defender": defender_cord
        }
