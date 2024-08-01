from ...base.component import Component
from .ball import Ball

def clamp(min_value, value, max_value):
    return max(min(value, max_value), min_value)

class Paddle(Component):
    def __init__(self, initial_x=0, initial_y=0, width=10, height=100, speed=10) -> None:
        super().__init__(initial_x, initial_y, speed)

        self.width = width
        self.height = height
        self.paddleEffect = 0.2

    def get_height(self):
        return self.height

    def collided_with_ball(self, ball: Ball):
        ball_coordinate = ball.get_coord()
        ball_radius = ball.get_radius()
        ball_x = ball_coordinate[0]
        ball_y = ball_coordinate[1]

        if (ball_x + ball_radius > self.x and 
            ball_x - ball_radius < self.x + self.width and 
            ball_y + ball_radius > self.y and 
            ball_y - ball_radius < self.y + self.height):

            # we put the ball right outside the paddle
            # hit left side
            new_y = ball_y
            new_x = ball_x
            # its within the x boundary = it probably hit top
            if (ball_x >= self.x and ball_x <= self.x + self.width):
                ball.reverse_y()
                if (ball_y < self.y):
                    new_y = self.y - ball_radius
                elif (ball_y > self.y + self.height):
                    new_y = self.y + self.height + ball_radius

                # hit top == does not affect up down velo
                y_velo = 0
            else:
                ball.reverse_x()
                if (ball_x < self.x):
                    new_x = self.x - ball_radius
                elif (ball_x > self.x + self.width):
                    new_x = self.x + self.width + ball_radius

                # hit side == does not affect left rihgt
                x_velo = 0
            ball.set_coord(new_x, new_y)

            x_velo, y_velo = self.get_velocity()
            ball_x_velo, ball_y_velo = ball.get_velocity()

            # paddle effect on updown ball cannot be more than idk, 65? deg?

            new_x_velo = clamp(-0.906, ball_x_velo + (x_velo * self.paddleEffect), 0.906)
            new_y_velo = clamp(-0.906, ball_y_velo + (y_velo * self.paddleEffect), 0.906)

            ball.set_velocity(new_x_velo, new_y_velo)