from ...base.state import State
import time
from datetime import datetime
import math
from ...base.game import Game

class startingCountDown(State):
    def __init__(self, nextState, time, gameInstance: Game) -> None:
        super().__init__(gameInstance)
        self.next = nextState
        self.time = time
        self.timeLeft = time
        self.startTime = datetime.now()
        self.gameInstance = gameInstance
        # ??? why u hang ???
        # self.startTime = time.time() # hm yes bad idea

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.timeLeft = max(0, self.time - difference)

    def stateEnded(self):
        # a bit of leeway for the stuff to render
        if self.timeLeft < 0.25:
            self.gameInstance.setPlayed()
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
