from ...base.state import State
from ...pong.pong import PongGame
from .score import Score

class ProcessPhysics(State):
    def __init__(self, gameInstance: PongGame) -> None:
        super().__init__()
        self.gameInstance = gameInstance
    
    def runState(self):
        frameRate = self.gameInstance.FRAME_RATE
        self.gameInstance.field.renderFrame(frameRate)
        scored, whoScored = self.gameInstance.field.checkGoal()
        if (scored):
            self.setforcedTransition(Score(whoScored, self, self.gameInstance))

    def getData(self):
        return self.gameInstance.field.getFrame()

    def nextState(self):
        return None

    def stateEnded(self):
        return None