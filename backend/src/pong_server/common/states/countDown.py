from ...base.state import State
import time
from datetime import datetime
import math

class CountDown(State):
    def __init__(self, nextState, time, gameInstance) -> None:
        super().__init__(gameInstance)
        self.next = nextState
        self.time = time
        self.timeLeft = time
        self.startTime = datetime.now()
        # ??? why u hang ???
        # self.startTime = time.time() # hm yes bad idea

    async def runState(self):
        if self.gameInstance.canStart():
            currentTime = datetime.now()
            # currentTime = time.time()
            difference = (currentTime - self.startTime).total_seconds()
            # difference = currentTime - self.startTime
            self.timeLeft = max(0, self.time - difference)
        else:
            from .playerLeft import PlayerLeft
            self.setforcedTransition(PlayerLeft(CountDown(self.next, self.time, self.gameInstance), self.gameInstance))

    def stateEnded(self):
        # a bit of leeway for the stuff to render
        return (self.timeLeft < 0.25)

    def getData(self):
        return {
            "status": "countdown",
            "value": math.ceil(self.timeLeft)
        }

    def nextState(self):
        return self.next

    def setforcedTransition(self, nextState):
        self.time = 0
        return super().setforcedTransition(nextState)
