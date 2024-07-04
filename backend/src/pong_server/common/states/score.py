from ...base.state import State
from datetime import datetime
from .countDown import CountDown
from .reset import Reset

class Score(State):
    def __init__(self, whodunit, previousState, gameInstance, screenDuration=3) -> None:
        super().__init__()
        self.whodunit = whodunit
        self.previousState = previousState

        self.totalDuration = screenDuration
        self.durationLeft = screenDuration
        self.startTime = datetime.now()
        self.gameInstance = gameInstance

    def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.totalDuration - difference)

    def stateEnded(self):
        return (self.durationLeft < 0.25)

    def getData(self):
        return {
            "status": "score",
            "scorer": self.whodunit
        }
    
    def nextState(self):
        return CountDown(Reset(self.previousState, self.gameInstance), 3)
