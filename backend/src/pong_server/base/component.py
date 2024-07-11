import random
import math

class Component:
    def __init__(self, initial_x=0, initial_y=0, initial_speed=200) -> None:
        self.x = initial_x
        self.y = initial_y
        self.x_velo = 0
        self.y_velo = 0
        self.speed = initial_speed

    def set_coord(self, new_x, new_y):
        self.x = new_x
        self.y = new_y

    def set_x(self, new_x):
        self.x = new_x

    def set_y(self, new_y):
        self.y = new_y

    def set_speed(self, speed):
        self.speed = speed

    def get_coord(self):
        return (self.x, self.y)
    
    def get_json_coord(self):
        return {
            "x": self.x,
            "y": self.y
        }

    # make sure min angle is >= 0 and max_angle is <= 90
    # also, max_angle > min_angle
    def random_velocity(self, min_angle=15, max_angle=65):
        angle = random.uniform((math.radians(min_angle)), math.radians(max_angle))
        x = 1 if random.random() < 0.5 else -1
        y = math.tan(angle) if random.random() < 0.5 else -math.tan(angle)
        self.set_velocity(x, y)

    def get_velocity(self):
        return (self.x_velo, self.y_velo)

    def set_velocity(self, x_velo, y_velo):
        # normalize vector
        mag = math.sqrt((x_velo * x_velo) + (y_velo * y_velo))
        if mag:
            x_velo /= mag
            y_velo /= mag

        self.x_velo = x_velo
        self.y_velo = y_velo

    def reverse_x(self):
        self.x_velo *= -1

    def reverse_y(self):
        self.y_velo *= -1

    def move_Component(self, delta):
        self.x += self.x_velo * delta * self.speed
        self.y += self.y_velo * delta * self.speed
