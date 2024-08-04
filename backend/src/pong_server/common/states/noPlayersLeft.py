from ...base.state import State
from .saveGameData import saveGameData
from datetime import datetime
from math import ceil

class noPlayersLeft(State):
    def __init__(self, gameInstance, previousState, duration=10) -> None:
        super().__init__(gameInstance)
        self.previousState = previousState

        self.countdownReached = False
        self.endCountdown = False

        self.duration = duration
        self.durationLeft = duration
        self.startTime = datetime.now()

    async def runState(self):
        currentTime = datetime.now()
        difference = (currentTime - self.startTime).total_seconds()
        self.durationLeft = max(0, self.duration - difference)

        if (not self.gameInstance.emptyLobby()):
            self.endCountdown = True

        if (self.durationLeft < 0.25):
            self.countdownReached = True
            self.endCountdown = True

    def nextState(self):
        if self.countdownReached:
            return saveGameData(self.gameInstance)
        else:
            return self.previousState

    def stateEnded(self):
        return self.endCountdown

    def getData(self):
        return {
            'status': 'pause',
            'message': f"All players left, Game ends in {ceil(self.durationLeft)} seconds"
        }