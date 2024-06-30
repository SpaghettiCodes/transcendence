import random
from backend.src.pong_server.pong.pong import PongGame
from channels.layers import get_channel_layer

# 8 tuo
class TournamentServer:
    def __init__(self) -> None:
        self.players = []
        self.spectators = []

    def spectatorJoin(self, username):
        pass

    def playerJoin(self, username):
        pass

    def getPlayers(self):
        return {
            "players": self.players
        }

    def matchUp(self) -> None:
        random.shuffle(self.players)
        half = len(self.players) // 2
        first_half = [self.players[x] for x in range(half)]
        second_half = [self.players[x] for x in range(half, len(self.players))]

        matchup = ([first_half[x], second_half[x]] for x in range(len(first_half)))
        