from ...base.state import State
from datetime import datetime
import math

class endGame(State):
    def __init__(self, gameInstance, durationUntilClose) -> None:
        super().__init__(gameInstance)
        self.duration = durationUntilClose
        self.durationLeft = durationUntilClose
        self.startTime = datetime.now()

        self.gameInstance.uploadScores()
        self.kickEveryoneOut = False

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.duration - difference)

        if (self.durationLeft < 0.25):
            self.kickEveryoneOut = True
            self.gameInstance.removeFromServer()

    def getData(self):
        if not self.kickEveryoneOut:
            return {
                "status": "end",
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