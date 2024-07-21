from ..pong.pong import PongGame
from .gameframe import GameFrame

class APongUsGame(PongGame):
    def __init__(self, gameid, removalFunction, subserver_id=None, hidden=False, expectedPlayers=[]) -> None:
        super().__init__(gameid, removalFunction, subserver_id, hidden, expectedPlayers)

        self.type = "apong"

        self.field = GameFrame()

        self.attackerid = None
        self.defenderid = None
