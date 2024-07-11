from ...base.state import State
from .countDown import CountDown

class Pause(State):
    def __init__(self, previousState, gameInstance) -> None:
        super().__init__(gameInstance)
        self.paused = True
        self.previousState = previousState

    async def runState(self):
        pass

    def stateEnded(self):
        return self.gameInstance.canStart()

    def nextState(self):
        return CountDown(self.previousState, 3, self.gameInstance)

    def getData(self):
        return { "status": "pause" }
