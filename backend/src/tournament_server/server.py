import random
from pong_server.pong.pong import PongGame
from channels.layers import get_channel_layer
from pong_server.server import PongServer

from django.core.exceptions import ObjectDoesNotExist

from datetime import datetime
from math import ceil

from asgiref.sync import sync_to_async, async_to_sync

from database.models import Tournament, TournamentResult, TournamentRound, Player, Match
from api.serializer import MatchSerializer
from util.base_converter import from_base52, to_base52

import asyncio

# 8 tournament ig
class TournamentServer:
    def __init__(
            self,
            id,
            removalFunction,
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

        self.removalFunction = removalFunction

        # for database saving
        self.completePlayers = []
        self.completeResults = []

        # for running the server
        self.currentPlayers = []
        self.expectedPlayers = []
        self.losers = []
        self.round = 0

        self.currentResults = []

        self.readiedPlayers = []
        self.matchesCount = 0
        self.matchesPlayed = 0

        self.spectators = []

        self.channel_layer = get_channel_layer()

        self.tournamentStarted = False
        self.onGoingMatch = False

        self.loop_start = None
        self.loop_end = None

        self.winner = None

    def isFull(self):
        return len(self.currentPlayers) >= self.maxPlayers

    def hasStarted(self):
        return self.tournamentStarted

    def isHidden(self):
        return self.hidden

    def get_data(self):
        return {
            "id": self.id,
            "players": len(self.currentPlayers),
            "spectators": len(self.spectators),
            "started": self.tournamentStarted,
            "round": self.round,
        }

    def spectatorJoin(self, username):
        self.spectators.append(username)

    def spectatorLeft(self, username):
        self.spectators.remove(username)

    async def playerJoin(self, username):
        if username in self.losers:
            return (False, "You lost!")
        if self.tournamentStarted and username not in self.expectedPlayers:
            return (False, "Tournament Already Started")
        if len(self.currentPlayers) >= self.maxPlayers:
            return (False, "Max player allowed")

        if (username not in self.currentPlayers):
            self.currentPlayers.append(username)

        await self.refresh_PlayerList()
        await self.update_list()

        return (True, "Everything went well, yep")

    async def playerLeft(self, username):
        if not self.onGoingMatch: # temp, think of a fix later
            if username in self.currentPlayers:
                self.currentPlayers.remove(username)

            if username in self.readiedPlayers:
                self.readiedPlayers.remove(username)

            if not len(self.currentPlayers):
                await self.removalFunction()

            await self.refresh_PlayerList()
            await self.update_list()

    async def readyUp(self, username):
        if username not in self.currentPlayers:
            return (False, "Not in the game")

        if username not in self.readiedPlayers:
            self.readiedPlayers.append(username)

        await self.refresh_PlayerList()

        if (self.canStart()):
            self.loop_start = asyncio.create_task(self.startMatch())

        return (True, "")

    async def disReadyUp(self, username):
        if username not in self.readiedPlayers:
            return (False, "User not readeid")

        self.readiedPlayers.remove(username)

        await self.refresh_PlayerList()
        return (True, "")

    def getSerializedCompleteResults(self):
        data = [ [ match.matchid for match in round ] for round in self.completeResults ]
        return data

    def getDetails(self):
        return {
            "players": self.currentPlayers,
            "ready": self.readiedPlayers,
            "spectators": self.spectators,
            "started": self.tournamentStarted,
            "previousMatches": self.getSerializedCompleteResults(),
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
        async def checkerFunction(durationLeft):
            if not self.canStart():
                await self.notify_Cancel()
                return False

            if not self.tournamentStarted:
                msg = f"The tournament will start in {ceil(durationLeft)} seconds"
            else:
                msg = f"The next round will start in {ceil(durationLeft)} seconds"
            await self.notify_Timer(msg)
            return True

        # 3 second delay
        if not await self.delaySeconds(3, checkerFunction):
            return

        if not self.tournamentStarted:
            if not self.canBeginTournament():
                return
            # first initialization
            self.tournamentStarted = True
            self.completePlayers = [player for player in self.currentPlayers]
            self.expectedPlayers = [player for player in self.currentPlayers]

        self.onGoingMatch = True
        self.round += 1

        print("yooo starting the match!!1!!11")
        await self.matchUp()
        await self.notify_ToRefresh()
        await self.update_list()

    def reset(self):
        self.onGoingMatch = False
        self.matchesCount = 0
        self.matchesPlayed = 0
        self.currentResults = []
        # temp
        self.playedIDs = []
        # temp end
        self.readiedPlayers = []

    async def delaySeconds(self, duration, functionToRun=None):
        startTime = datetime.now()
        totalDuration = 1 # TEMP, REMEMBER TO CHNAGE, I DONT WANT TO WAIT 10 YEARS ONLY
        durationLeft = totalDuration

        while (durationLeft > 0.25):
            currentTime = datetime.now()
            difference = (currentTime - startTime).total_seconds()
            durationLeft = max(0, totalDuration - difference)

            if functionToRun is not None:
                result = await functionToRun(durationLeft=ceil(durationLeft))
                if not result:
                    return False

            await asyncio.sleep(0.1)
        return True

    async def endTournament(self):
        print("Tournament has ended")
        self.winner = self.currentPlayers[0]

        # delay 10 secs, then only remove
        await self.delaySeconds(10, functionToRun=self.notify_End)

        await self.removalFunction()

        await self.notify_kickEveryone()

    async def endMatch(self):
        print("One round of the tournament ended")

        # save the result
        self.completeResults.append(self.currentResults)

        self.reset()

        if (len(self.currentPlayers) == 1):
            asyncio.create_task(self.endTournament())

    async def matchUp(self) -> None:
        random.shuffle(self.currentPlayers)
        half = len(self.currentPlayers) // 2
        first_half = [self.currentPlayers[x] for x in range(half)]
        second_half = [self.currentPlayers[x] for x in range(half, len(self.currentPlayers))]

        matchups = [(first_half[x], second_half[x]) for x in range(len(first_half))]

        for matchup in matchups:
            gameId = await sync_to_async(PongServer.new_game) (
                expectedPlayers=[matchup[0], matchup[1]],
                subserver_id=self.subserverId
            )

            # i have only myself to blame for this situation
            gameInstance = PongServer.getGameInstance(gameId, self.subserverId)
            gameInstance.setRemovalFunction(self.collectData(gameInstance))
            await gameInstance.startImmediately()

            self.matchesCount += 1

    async def panicRemove(self):
        tournamentObject = await Tournament.objects.aget(tournamentid=self.id)
        await tournamentObject.adelete()

    async def uploadResults(self):
        if self.winner is None:
            # winner CANT be empty
            # this only means one thing, the tournament did not end and everyone left
            await self.panicRemove()
            return

        playerObjects: list[Player] = []
        winnerObject: Player = None
        tournamentObject: Tournament = None

        print(self.completePlayers)
        print(self.completeResults)

        try:
            tournamentObject = await Tournament.objects.aget(tournamentid=self.id)
        except ObjectDoesNotExist:
            print("what the fuck? tournamentID not found??")
            await self.panicRemove()
            return

        for player in self.completePlayers:
            try:
                playerObject = await Player.objects.aget(username=player)
                if (player == self.winner):
                    winnerObject = playerObject
                playerObjects.append(playerObject)
            except ObjectDoesNotExist:
                print("well that person doesnt exist")
                if (player == self.winner):
                    print("Cant really have a non existant winner...")
                    await self.panicRemove()
                    return

        print(playerObjects)

        # create new tournamentResult
        # add winner and players in
        newTournamentResult = await TournamentResult.objects.acreate(
            winner=winnerObject,
            tournament=tournamentObject
        )
        await newTournamentResult.players.aadd(*playerObjects)
        await newTournamentResult.asave()

        # create the rounds
        roundNumber = 1
        for round in self.completeResults:
            roundObject = await TournamentRound.objects.acreate(
                roundNumber=roundNumber,
                result=newTournamentResult
            )
            for matchObject in round:
                matchObject.related_tournament = roundObject
                await matchObject.asave()
            await roundObject.asave()
            roundNumber += 1

        tournamentObject.status = 2
        await tournamentObject.asave()
        print("done uploading")

    def collectData(self, gameInstance: PongGame):
        async def function():
            gameId = gameInstance.gameid
            subserverId = self.subserverId
            # remove game instance from Server
            await PongServer.createRemovalFunction(gameId, subserverId)()

            matchObject = await Match.objects.aget(matchid=gameId)

            self.currentResults.append(matchObject)

            loserGetter = lambda : matchObject.result.loser.username
            loser = await sync_to_async(loserGetter)()

            if loser in self.currentPlayers:
                self.currentPlayers.remove(loser)
            if loser in self.expectedPlayers:
                self.expectedPlayers.remove(loser)
            self.losers.append(loser)

            self.matchesPlayed += 1
            await self.notify_ToRefresh()

            if (self.matchesPlayed == self.matchesCount):
                await self.endMatch()

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
            "type": "message",
            "text": {
                "matches": self.getMatches()
            }
        })

    async def notify_oldMatches(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "matches": self.getSerializedCompleteResults()
            }
        })

    async def notify_ToRefresh(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "refresh"
            }
        })

    async def notify_Timer(self, msg) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "timer",
                "message": msg
            }
        })

    async def notify_Cancel(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "cancel",
            }
        })

    async def notify_End(self, durationLeft) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "winner",
                "winner": self.winner,
                "time": durationLeft
            }
        })
        return True

    async def notify_kickEveryone(self) -> None:
        await self.channel_layer.group_send(self.groupName, {
            "type": "message",
            "text": {
                "status": "leave",
            }
        })

    async def update_list(self):
        from .manager import TournamentManager
        await TournamentManager.update_list()

