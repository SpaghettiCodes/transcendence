from ...base.state import State
from datetime import datetime
import asyncio
import math

class endGame(State):
    def __init__(self, gameInstance, durationUntilClose=3) -> None:
        super().__init__(gameInstance)
        self.duration = durationUntilClose
        self.durationLeft = durationUntilClose
        self.startTime = datetime.now()

        self.winner = self.gameInstance.getWinner()
        self.removingFromServer = False
        self.kickEveryoneOut = False

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.duration - difference)

        if (self.durationLeft < 0.25 and not self.removingFromServer):
            self.removingFromServer = True
            await self.gameInstance.removeFromServer()
            self.kickEveryoneOut = True

    def getData(self):
        if not self.kickEveryoneOut:
            return {
                "status": "end",
                "winner": self.winner,
                "lifetime": math.ceil(self.durationLeft)
            }
        else: 
            return {
                "status": "redirect"
            }

    def nextState(self):
        return None

    def stateEnded(self):
        return False