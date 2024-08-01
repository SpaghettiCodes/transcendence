from ...base.state import State
from .countDown import CountDown
from datetime import datetime
from .saveGameData import saveGameData
from math import ceil

class PlayerLeft(State):
    # TODO: Change the wait timing to something else more suitable
    def __init__(self, previousState, gameInstance, duration=10) -> None:
        super().__init__(gameInstance)
        self.paused = True
        self.killTheGame = False

        self.previousState = previousState
        self.missingPlayer = gameInstance.getMissingPlayer()
        self.duration = duration
        self.durationLeft = duration
        self.startTime = datetime.now()

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.duration - difference)

        if (self.durationLeft < 0.25):
            self.killTheGame = True

    def stateEnded(self):
        return self.gameInstance.canStart() or self.killTheGame

    def nextState(self):
        if self.killTheGame:
            self.gameInstance.setForfeit()
            return saveGameData(self.gameInstance)
        return CountDown(self.previousState, 3, self.gameInstance)

    def getData(self):
        return {
            "status": "pause",
            "message": f"Player {self.missingPlayer} forfeits in {ceil(self.durationLeft)}"
        }
