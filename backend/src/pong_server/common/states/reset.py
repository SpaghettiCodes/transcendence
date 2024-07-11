from ...base.state import State
from ...pong.pong import PongGame
from .pause import Pause

class Reset(State):
    def __init__(self, nextState, gameInstance: PongGame) -> None:
        super().__init__(gameInstance)
        self.next = nextState
        self.dataSent = False

    async def runState(self):
        self.gameInstance.resetField()
        if not self.gameInstance.canStart():
            self.setforcedTransition(Pause(self.next, self.gameInstance))

    def stateEnded(self):
        return self.dataSent
    
    def getData(self):
        self.dataSent = True
        return self.gameInstance.field.getFrame()
    
    def nextState(self):
        return self.next
