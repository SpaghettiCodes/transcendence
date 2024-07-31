from ...base.state import State

class saveGameData(State):
    def __init__(self, gameInstance) -> None:
        super().__init__(gameInstance)
    
    async def runState(self):
        self.gameInstance.set_ended()
        await self.gameInstance.removeFromServer()

    def getData(self):
        return {
            'status': 'redirect'
        }
    
    def nextState(self):
        return None

    def stateEnded(self):
        return False