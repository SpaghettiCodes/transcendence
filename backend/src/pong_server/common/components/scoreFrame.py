from ...base.component import Component
from .ball import Ball

class scoreFrame(Component):
    def __init__(self, x, y, width=10, height=120) -> None:
        # note that x y is the top right of the triangle
        # i think
        super().__init__(x, y)
        self.width = width
        self.height = height

    def ball_within_boundary(self, ball: Ball) -> bool:
        # basically the same as paddle
        # but we do NOT change direction of ball

        ball_coordinate = ball.get_coord()
        ball_radius = ball.get_radius()
        ball_x = ball_coordinate[0]
        ball_y = ball_coordinate[1]

        if (ball_x + ball_radius >= self.x and 
            ball_x - ball_radius <= self.x + self.width and 
            ball_y + ball_radius >= self.y and 
            ball_y - ball_radius <= self.y + self.height):
            return True
        return False
