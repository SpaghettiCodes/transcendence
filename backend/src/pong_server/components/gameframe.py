class GameFrame:
    def __init__(self, width=750, height=350, ball=None, attacker=None, defender=None) -> None:
        self.width = width
        self.height = height
        self.ball = ball
        self.attacker = attacker
        self.defender = defender

    def get_dimensions(self):
        return (self.width, self.height)
    
    def calculate_logics(self):
        self.ball_logic()

    def ball_logic(self):
        ball_cord = self.ball.get_coord()
        ball_radius = self.ball.get_radius()

        # wall collision
        if (ball_cord[0] - ball_radius < 0 or 
            ball_cord[0] + ball_radius > self.width):
            self.ball.reverse_x()
        elif (ball_cord[1] - ball_radius < 0 or 
              ball_cord[1] + ball_radius > self.height):
            self.ball.reverse_y()

        self.attacker.collided_with_ball(self.ball)
        self.defender.collided_with_ball(self.ball)

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