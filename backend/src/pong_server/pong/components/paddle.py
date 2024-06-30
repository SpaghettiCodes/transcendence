from ...base.component import Component

class Paddle(Component):
    def __init__(self, initial_x=0, initial_y=0, width=10, height=50) -> None:
        super().__init__(initial_x, initial_y)
        self.width = 10
        self.height = 100

    def get_height(self):
        return self.height

    def collided_with_ball(self, ball):
        # why is x and y the top fucking corner of the rect
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
            else:
                ball.reverse_x()
                if (ball_x < self.x):
                    # i can just set x based on paddle
                    # thanks wallace for suggestion
                    new_x = self.x - ball_radius
                # hit right side
                elif (ball_x > self.x + self.width):
                    new_x = self.x + self.width + ball_radius
            ball.set_coord(new_x, new_y)
