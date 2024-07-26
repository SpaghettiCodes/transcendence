from ...base.component import Component
import random
import math
# set this as total number of color of balls you can find in BALL_PIC_DIR
BALL_PIC_DIR = '/media/amogus/'
BALL_PIC_NAME = 'amongBall-'
BALL_PIC_EXTENSION = '.png'
TOTAL_BALL_COLOR = 16

class Ball(Component):
    def __init__(self, initial_x=0, initial_y=0, radius=7, speed=200, ballNo=None) -> None:
        super().__init__(initial_x, initial_y, speed)
        self.radius = radius

        if ballNo is None:
            self.colorNo = random.randrange(0, TOTAL_BALL_COLOR)
        else:
            self.colorNo = ballNo % TOTAL_BALL_COLOR

    def getPicName(self):
        return BALL_PIC_DIR + BALL_PIC_NAME + str(self.colorNo) + BALL_PIC_EXTENSION

    def swapToAnotherColor(self):
        self.colorNo = random.randrange(0, TOTAL_BALL_COLOR)

    def getColorValue(self):
        return self.colorNo

    """
    fucking dot prod
    """
    def get_rotation_value(self):
        straight_ahead = (1, 0)
        # dot prod
        # a \dot b = |a||b| cos theta
        # a \dot b / |a| = cos theta

        if (self.y_velo == 0):
            if (self.x_velo < 0):
                return 180
            return 0

        cosTheta = (self.x_velo * 1) / math.sqrt(self.x_velo ** 2 + self.y_velo ** 2)
        angle = math.degrees(math.acos(cosTheta))

        # going up
        # note that y_velo is decreasing when we are going up
        # cuz uhhh, 0, 0 is top left
        if (self.y_velo < 0):
            angle = 360 - angle
        return angle

    def get_json_coord(self):
        return {
            **super().get_json_coord(),
            'facing': self.get_rotation_value(),
            'imageDir': self.getPicName()
        }

    def get_radius(self):
        return self.radius
