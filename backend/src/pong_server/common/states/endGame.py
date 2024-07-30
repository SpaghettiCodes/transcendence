from ...base.state import State
from datetime import datetime
from .saveGameData import saveGameData
import asyncio
import math

class endGame(State):
    def __init__(self, gameInstance, durationUntilClose=3) -> None:
        super().__init__(gameInstance)
        self.duration = durationUntilClose
        self.durationLeft = durationUntilClose
        self.startTime = datetime.now()

        self.winner = self.gameInstance.getWinner().username

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.duration - difference)

    def getData(self):
        return {
            "status": "end",
            "winner": self.winner,
            "lifetime": math.ceil(self.durationLeft)
        }

    def nextState(self):
        return saveGameData(self.gameInstance)

    def stateEnded(self):
        return self.durationLeft < 0.25