from ...base.state import State
from ...pong.pong import PongGame

class Reset(State):
    def __init__(self, nextState, gameInstance: PongGame) -> None:
        super().__init__()
        self.next = nextState
        self.gameInstance = gameInstance
        self.dataSent = False

    def runState(self):
        self.gameInstance.resetField()
    
    def stateEnded(self):
        return self.dataSent
    
    def getData(self):
        self.dataSent = True
        return self.gameInstance.field.getFrame()
    
    def nextState(self):
        return self.next
