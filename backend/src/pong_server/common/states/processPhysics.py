from ...base.state import State
from .score import Score
from .playerLeft import PlayerLeft

class ProcessPhysics(State):
    async def runState(self):
        if (not self.gameInstance.canStart()):
            self.setforcedTransition(PlayerLeft(self, self.gameInstance))
            return

        frameRate = self.gameInstance.FRAME_RATE
        self.gameInstance.field.renderFrame(frameRate)
        scored, whoScored = self.gameInstance.field.checkGoal()
        if (scored):
            self.setforcedTransition(Score(whoScored.username, self, self.gameInstance))

    def getData(self):
        return self.gameInstance.field.getFrame()

    def nextState(self):
        return None

    def stateEnded(self):
        return None