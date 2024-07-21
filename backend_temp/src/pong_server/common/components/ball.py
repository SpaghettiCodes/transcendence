from ...base.component import Component

class Ball(Component):
    def __init__(self, initial_x=0, initial_y=0, radius=7, speed=200) -> None:
        super().__init__(initial_x, initial_y, speed)
        self.radius = radius

    def get_radius(self):
        return self.radius
