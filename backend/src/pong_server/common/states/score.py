from ...base.state import State
from datetime import datetime
from .countDown import CountDown
from .reset import Reset
from .endGame import endGame

class Score(State):
    def __init__(self, whodunit, previousState, gameInstance, screenDuration=3) -> None:
        super().__init__(gameInstance)
        self.whodunit = whodunit
        self.previousState = previousState

        self.sendUpdate = True
        self.totalDuration = screenDuration
        self.durationLeft = screenDuration
        self.startTime = datetime.now()

        self.endGame = False
        if self.gameInstance.field.getMaxScore() >= self.gameInstance.getMaxScore():
            self.endGame = True

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.totalDuration - difference)

    def stateEnded(self):
        return (self.durationLeft < 0.25)

    def getData(self):
        if self.sendUpdate:
            self.sendUpdate = False
            return {
                "status": "score",
                "scorer": self.whodunit,
                "update": True
            }
        return {
            "status": "score",
            "scorer": self.whodunit,
            "update": False
        }

    def nextState(self):
        if self.endGame:
            return endGame(self.gameInstance)
        return CountDown(Reset(self.previousState, self.gameInstance), 3, self.gameInstance)
