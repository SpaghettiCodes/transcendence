from ..common.components.scoreFrame import scoreFrame
from ..common.components.ball import Ball
from ..common.components.paddle import Paddle

import random
import math

class GameFrame:
    def __init__(
            self,
            width=750,
            height=350
        ) -> None:
        self.width = width
        self.height = height

        self.ballRadius = 10
        self.ballSpeed = 350
        self.ball = Ball(radius=self.ballRadius, speed=self.ballSpeed)

        # try to maintain a 493 w and 590 h 
        # ie around 2/3
        # so the image doesnt look like shit

        # self.paddleWidth = 80
        # self.paddleHeight = 120

        # k nvm, looks like ass
        self.paddleWidth = 30
        self.paddleHeight = 110
        # self.paddleHeight = self.height

        self.paddleOffset = 20
        self.paddleSpeed = 450

        self.attacker = Paddle(width=self.paddleWidth, height=self.paddleHeight, speed=self.paddleSpeed)
        self.defender = Paddle(width=self.paddleWidth, height=self.paddleHeight, speed=self.paddleSpeed)

        self.goalWidth = 1

        self.attackerGoal = scoreFrame(0, 0, width=self.goalWidth, height=self.height)
        self.defenderGoal = scoreFrame(self.width - self.goalWidth, 0, width=self.goalWidth, height=self.height)

        # TODO: REMEMBER TO CHANGE LATER
        # self.attackerGoal = scoreFrame(-5, 0, width=self.goalWidth, height=self.height)
        # self.defenderGoal = scoreFrame(-5, 0, width=self.goalWidth, height=self.height)

        self.attackerObject = None
        self.defenderObject = None

        self.attackerScore = 0
        self.defenderScore = 0

    def getDetails(self):
        return {
            "width": self.width,
            "height": self.height,
            "ball": {
                "radius": self.ballRadius
            },
            "paddle": {
                "width": self.paddleWidth,
                "height": self.paddleHeight
            },
        }

    def getWinnerLoser(self):
        if self.attackerScore > self.defenderScore:
            return (self.attackerObject, self.defenderObject)
        return (self.defenderObject, self.attackerObject)

    def getMaxScore(self):
        return max(self.attackerScore, self.defenderScore)

    def getJsonScore(self):
        return {
            "attacker": self.attackerScore,
            "defender": self.defenderScore
        }

    def get_dimensions(self):
        return (self.width, self.height)

    def getAttackerPaddle(self):
        return self.attacker

    def getDefenderPaddle(self):
        return self.defender

    def renderFrame(self, delta):
        self.attacker.move_Component(delta)
        self.defender.move_Component(delta,)
        self.ball.move_Component(delta)
        self.ball_collided_with_wall(self.ball)
        self.attacker.collided_with_ball(self.ball)
        self.defender.collided_with_ball(self.ball)
        self.paddle_logic()

    def checkGoal(self):
        if self.attackerGoal.ball_within_boundary(self.ball):
            self.defenderScore += 1
            return (True, self.defenderObject)
        elif self.defenderGoal.ball_within_boundary(self.ball):
            self.attackerScore += 1
            return (True, self.attackerObject)
        return (False, "No one scored")
    
    def ball_collided_with_wall(self, ball):
        ball_cord = ball.get_coord()
        ball_radius = ball.get_radius()

        if (ball_cord[0] - ball_radius < 0 or 
            ball_cord[0] + ball_radius > self.width):
            if (ball_cord[0] - ball_radius < 0):
                ball.set_x(ball_radius)
            else:
                ball.set_x(self.width - ball_radius)
            ball.reverse_x()

        elif (ball_cord[1] - ball_radius < 0 or 
              ball_cord[1] + ball_radius > self.height):
            if (ball_cord[1] - ball_radius < 0):
                ball.set_y(ball_radius)
            else:
                ball.set_y(self.height - ball_radius)
            ball.reverse_y()

    def paddle_logic(self):
        paddles = [self.attacker, self.defender]
        for paddle in paddles:
            x_value, y_value = paddle.get_coord()
            paddle_height = paddle.get_height()
            if (y_value < 0 or y_value + paddle_height > self.height):
                if (y_value < 0):
                    y_value = 0
                else:
                    y_value = self.height - paddle_height
                paddle.set_coord(x_value, y_value)

    def getFrame(self):
        attacker_cord = self.attacker.get_json_coord()
        defender_cord = self.defender.get_json_coord()
        ball_cord = self.ball.get_json_coord()

        return {
            "status": "update",
            "balls": [ball_cord],
            "attacker": {
                **attacker_cord
            },
            "defender": {
                **defender_cord
            }
        }

    def initialization(self):
        self.attacker.set_coord(self.paddleOffset, (self.height / 2) - (self.paddleHeight / 2))
        self.defender.set_coord(self.width - self.paddleOffset - self.paddleWidth, (self.height / 2) - (self.paddleHeight / 2))

        self.ball.set_coord(self.width / 2, self.height / 2)
        self.ball.random_velocity()

    def setPlayers(self, attackerObject, defenderObject):
        self.attackerObject = attackerObject
        self.defenderObject = defenderObject
