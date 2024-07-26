from __future__ import annotations
from ...base.component import Component
from ...common.components.ball import Ball

class Vent(Component):
    def __init__(self, exit: Vent, width, height, initial_x=0, initial_y=0) -> None:
        super().__init__(initial_x, initial_y)
        self.exit = exit
        self.width = width
        self.height = height
        self.teleportOut = []
        self.teleportIn = []

    def setExit(self, exit: Vent):
        self.exit = exit

    def setTeleportIn(self, ball: Ball):
        self.teleportIn.append(ball)

    def setTeleportOut(self, ball: Ball):
        self.teleportOut.append(ball)

    def ball_within_boundary(self, ball: Ball) -> bool:
        # basically the same as paddle
        # but we do NOT change direction of ball
        # and we change the POSITION

        ball_x, ball_y = ball.get_coord()
        ball_radius = ball.get_radius()

        if (ball_x - ball_radius >= self.x and 
            ball_x + ball_radius <= self.x + self.width and
            ball_y - ball_radius <= self.y + (self.height / 2) and
            ball_y + ball_radius >= self.y + (self.height / 2)):
            # within the boundary
            if (
                ball not in self.teleportIn and
                ball not in self.teleportOut
                ):
                vent_x, vent_y = self.exit.get_coord()
                vent_y_height = self.exit.height / 2
                d_from_left_corner = ball_x - self.x
                ball.set_coord(vent_x + d_from_left_corner, vent_y + vent_y_height)
                # having all the balls at a constant color makes it trivially easy
                ball.swapToAnotherColor()
                self.exit.teleportOut.append(ball)

        elif (ball in self.teleportOut):
            self.teleportOut.remove(ball)