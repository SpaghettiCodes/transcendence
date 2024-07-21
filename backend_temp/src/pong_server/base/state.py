from abc import ABC, abstractmethod

class State(ABC):
    def __init__(self, gameInstance) -> None:
        self.gameInstance = gameInstance
        self.forcedTransition = False
        self.forcedNextTransition = None

    @abstractmethod
    async def runState(self):
        pass

    @abstractmethod
    def stateEnded(self):
        pass

    @abstractmethod
    def nextState(self):
        pass

    @abstractmethod
    def getData(self):
        pass

    def setforcedTransition(self, nextState):
        self.forcedTransition = True
        self.forcedNextTransition = nextState

    def forceTransition(self):
        forcedTransition = self.forcedTransition
        self.forcedTransition = False
        return (forcedTransition, self.forcedNextTransition)