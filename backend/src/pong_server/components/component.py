import math

class Component:
    def __init__(self, initial_x=0, initial_y=0) -> None:
        self.x = initial_x
        self.y = initial_y
        self.x_velo = 0
        self.y_velo = 0

    def set_coord(self, new_x, new_y):
        self.x = new_x
        self.y = new_y

    def get_coord(self):
        return (self.x, self.y)

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

    def move_Component(self, delta, speed=1):
        self.x += self.x_velo * delta * speed
        self.y += self.y_velo * delta * speed
