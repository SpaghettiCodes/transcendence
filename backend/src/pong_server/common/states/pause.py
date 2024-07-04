from ...base.state import State
from .countDown import CountDown

class Pause(State):
    def __init__(self, previousState) -> None:
        super().__init__()
        self.paused = True
        self.previousState = previousState

    def unpause(self):
        self.paused = False

    def runState(self):
        # well theres nothing to run...
        pass

    def stateEnded(self):
        return not self.paused

    def nextState(self):
        return CountDown(self.previousState, 3)

    def getData(self):
        return { "status": "pause" }
