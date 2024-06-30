import random

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

    def getAttackerPaddle(self):
        return self.attacker

    def getDefenderPaddle(self):
        return self.defender

    def renderFrame(self, delta):
        self.attacker.move_Component(delta, 150)
        self.defender.move_Component(delta, 150)
        self.ball.move_Component(delta, 200)
        self.ball_logic()
        self.paddle_logic()

    def ball_logic(self):
        ball_cord = self.ball.get_coord()
        ball_radius = self.ball.get_radius()

        # wall collision
        # for the width collision, we need to check points also
        if (ball_cord[0] - ball_radius < 0 or 
            ball_cord[0] + ball_radius > self.width):
            if (ball_cord[0] - ball_radius < 0):
                self.ball.set_x(ball_radius)
            else:
                self.ball.set_x(self.width - ball_radius)
            self.ball.reverse_x()

        elif (ball_cord[1] - ball_radius < 0 or 
              ball_cord[1] + ball_radius > self.height):
            if (ball_cord[1] - ball_radius < 0):
                self.ball.set_y(ball_radius)
            else:
                self.ball.set_y(self.height - ball_radius)
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

    def initialization(self):
        self.attacker.set_coord(20, 125)
        self.defender.set_coord(720, 125)
        self.ball.set_coord(375, 175)

        x_rand, y_rand = (0, 0)
        while ((not x_rand) and (not y_rand)):
            x_rand = (random.random() * 2) - 1
            y_rand = (random.random() * 2) - 1
        self.ball.set_velocity(x_rand, y_rand)