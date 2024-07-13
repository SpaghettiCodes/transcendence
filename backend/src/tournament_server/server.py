import random
from pong_server.pong.pong import PongGame
from channels.layers import get_channel_layer
from pong_server.server import PongServer

# 8 tournament ig
class TournamentServer:
    def __init__(
            self,
            id,
            hidden=False,
            minPlayers=2,
            maxPlayers=8,
            minRequiredReady=2,
        ) -> None:

        # server settings
        self.id = id
        self.hidden = hidden

        self.minPlayers = minPlayers
        self.maxPlayers = maxPlayers

        self.minRequiredReady = minRequiredReady

        self.subserverId = self.id
        self.groupName = f"tournament-{self.id}"

        # for database saving
        self.completePlayers = []
        self.completeResults = []

        # for running the server
        self.currentPlayers = []
        self.expectedPlayers = []

        self.currentResults = []

        self.readiedPlayers = []
        self.matchesCount = 0
        self.matchesPlayed = 0

        self.spectators = []

        self.channel_layer = get_channel_layer()

        self.tournamentStarted = False
        self.onGoingMatch = False

    def spectatorJoin(self, username):
        self.spectators.append(username)

    def spectatorLeft(self, username):
        self.spectators.remove(username)

    async def playerJoin(self, username):
        if self.tournamentStarted and username not in self.expectedPlayers:
            return (False, "Tournament Already Started")
        if len(self.currentPlayers) >= self.maxPlayers:
            return (False, "Max player allowed")

        if (username not in self.currentPlayers):
            self.currentPlayers.append(username)

        await self.refresh_PlayerList()
        return (True, "Everything went well, yep")

    async def playerLeft(self, username):
        if username in self.currentPlayers:
            self.currentPlayers.remove(username)

        if username in self.readiedPlayers:
            self.readiedPlayers.remove(username)

        await self.refresh_PlayerList()

    async def readyUp(self, username):
        if username not in self.currentPlayers:
            return (False, "Not in the game")

        if username not in self.readiedPlayers:
            self.readiedPlayers.append(username)

        await self.refresh_PlayerList()

        if (self.canStart()):
            await self.startMatch()
        return (True, "")

    async def disReadyUp(self, username):
        if username not in self.readiedPlayers:
            return (False, "User not readeid")

        self.readiedPlayers.remove(username)
        await self.refresh_PlayerList()

        return (True, "")

    def getDetails(self):
        return {
            "players": self.currentPlayers,
            "ready": self.readiedPlayers,
            "spectators": self.spectators,
            "started": self.tournamentStarted,
            "previousMatches": self.completeResults,
            "matches": self.getMatches()
        }
    
    def getMatches(self):
        matches = PongServer.get_servers_list(self.subserverId)
        if matches is None:
            return []
        return matches

    def canBeginTournament(self):
        return (
            len(self.currentPlayers) >= self.minPlayers
        )

    def canStart(self):
        return (
            len(self.readiedPlayers) >= self.minRequiredReady and
            not self.onGoingMatch
        )

    async def processInfo(self, data):
        username = data.get("username")
        if data.get("command") is None:
            return (False, "Invalid command")

        command = data.get("command")
        match command:
            case "ready":
                return await self.readyUp(username)
            case "unready":
                return await self.disReadyUp(username)
            case _:
                return (False, "Invalid command")

    async def startMatch(self):
        if not self.canStart():
            return

        if not self.tournamentStarted:
            if not self.canBeginTournament():
                return
            # first initialization
            self.tournamentStarted = True
            self.completePlayers = [player for player in self.currentPlayers]
            self.expectedPlayers = [player for player in self.currentPlayers]

        self.onGoingMatch = True

        print("yooo starting the match!!1!!11")
        await self.matchUp()
        await self.notify_ToRefresh()

    def reset(self):
        self.onGoingMatch = False
        self.matchesCount = 0
        self.matchesPlayed = 0
        self.currentResults = []
        self.readiedPlayers = []

    async def endMatch(self):
        print("One round of the tournament ended")

        # save the result
        self.completeResults.append(self.currentResults)
        self.reset()

    async def matchUp(self) -> None:
        random.shuffle(self.currentPlayers)
        half = len(self.currentPlayers) // 2
        first_half = [self.currentPlayers[x] for x in range(half)]
        second_half = [self.currentPlayers[x] for x in range(half, len(self.currentPlayers))]

        matchups = [(first_half[x], second_half[x]) for x in range(len(first_half))]

        for matchup in matchups:
            gameId = await PongServer.new_game(
                expectedPlayers=[matchup[0], matchup[1]],
                subserver_id=self.subserverId
            )
            # i have only myself to blame for this situation
            gameInstance = PongServer.getGameInstance(gameId, self.subserverId)
            gameInstance.setRemovalFunction(self.collectData(gameInstance))
            self.matchesCount += 1

    def collectData(self, gameInstance: PongGame):
        async def function():
            gameId = gameInstance.gameid
            subserverId = self.subserverId
            # remove game instance from Server
            await PongServer.createRemovalFunction(gameId, subserverId)()

            print("Game ended, collecting data...")
            results = gameInstance.getResults()
            self.currentResults.append(results)

            # collect data
            # i may do this differently

            # loser is kicked out of the tournament
            loser = results["loser"]
            if loser in self.currentPlayers:
                self.currentPlayers.remove(loser)
            if loser in self.expectedPlayers:
                self.expectedPlayers.remove(loser)

            self.matchesPlayed += 1
            if (self.matchesPlayed == self.matchesCount):
                await self.endMatch()

            await self.notify_ToRefresh()
        return function

    async def refresh_PlayerList(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "playerList",
                "players": self.currentPlayers,
                "ready": self.readiedPlayers
            }
        })

    async def notify_OnGoingMatches(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "start",
            "text": {
                "matches": self.getMatches()
            }
        })

    async def notify_oldMatches(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "start",
            "text": {
                "matches": self.completeResults
            }
        })

    async def notify_ToRefresh(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "refresh"
            }
        })

