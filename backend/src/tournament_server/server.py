import random
from pong_server.pong.pong import PongGame
from channels.layers import get_channel_layer
from pong_server.server import PongServer

from django.core.exceptions import ObjectDoesNotExist

from datetime import datetime
from math import ceil

from asgiref.sync import sync_to_async, async_to_sync

from database.models import Tournament, TournamentResult, TournamentRound, Player, Match
from api.serializer import MatchSerializer, PublicPlayerSerializer
from util.base_converter import from_base52, to_base52

from .matchUp import MatchUps

import asyncio

# 8 tournament ig
class TournamentServer:
    def __init__(
            self,
            id,
            removalFunction,
            hidden=False,
            minPlayers=[2, 4, 8], # TODO: CHANGE THESE VALUE TO SOMETHING APPROPRIATE
            maxPlayers=8, # TODO: CHANGE THESE VALUE TO SOMETHING APPROPRIATE
            minRequiredReady=[2, 4, 8], # TODO: CHANGE THESE VALUE TO SOMETHING APPROPRIATE
        ) -> None:

        # server settings
        self.id = id
        self.hidden = hidden

        self.minPlayers = minPlayers
        self.maxPlayers = maxPlayers

        self.minRequiredReady = minRequiredReady

        self.groupName = f"tournament-{self.id}"

        self.removalFunction = removalFunction

        # for database saving
        self.completePlayers = []
        self.completeResults = []

        self.currentlyRunningMatches = []

        # for running the server
        self.currentPlayers = []
        self.expectedPlayers = []
        self.losers = []
        self.round = 0

        self.readiedPlayers = []
        self.matchesCount = 0
        self.matchesPlayed = 0

        self.innerMatchUps = []

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

    def spectatorJoin(self, playerObject):
        self.spectators.append(playerObject)

    def spectatorLeft(self, playerObject):
        self.spectators.remove(playerObject)

    def isExpected(self, playerObject):
        return playerObject in self.expectedPlayers

    async def playerJoin(self, playerObject):
        if playerObject in self.losers:
            return (False, "You lost!", 'lost')
        if self.tournamentStarted and playerObject not in self.expectedPlayers:
            return (False, "Tournament Already Started", 'tournament_started')
        if len(self.currentPlayers) >= self.maxPlayers:
            return (False, "Max player allowed", 'max_player')

        if (playerObject not in self.currentPlayers):
            self.currentPlayers.append(playerObject)

        await self.refresh_PlayerList()
        await self.update_list()

        return (True, "Everything went well, yep", '')

    async def playerLeft(self, playerObject):
        if not self.onGoingMatch: # temp, think of a fix later
            if playerObject in self.currentPlayers:
                self.currentPlayers.remove(playerObject)

            if playerObject in self.readiedPlayers:
                self.readiedPlayers.remove(playerObject)

            if not len(self.currentPlayers):
                await self.removalFunction()

            await self.refresh_PlayerList()
            await self.update_list()

    async def readyUp(self, playerObject):
        if playerObject not in self.currentPlayers:
            return (False, "Not in the game", 'not_in_game')

        if playerObject not in self.readiedPlayers:
            self.readiedPlayers.append(playerObject)

        await self.refresh_PlayerList()

        if (self.canStart()):
            self.loop_start = asyncio.create_task(self.startMatch())

        return (True, "", '')

    async def disReadyUp(self, playerObject):
        if playerObject not in self.readiedPlayers:
            return (False, "User not readeid", 'not_readied')

        self.readiedPlayers.remove(playerObject)

        await self.refresh_PlayerList()
        return (True, "", '')

    def getSerializedCompleteResults(self):
        data = [ [ match.matchid for match in round ] for round in self.completeResults ]
        return data

    def getDetails(self):
        return {
            "players": PublicPlayerSerializer(self.currentPlayers, many=True).data,
            "ready": [player.username for player in self.readiedPlayers],
            "started": self.tournamentStarted,
            "previousMatches": [ MatchSerializer(round, many=True).data for round in self.completeResults ],
            "matches": [match.get_data() for match in self.currentlyRunningMatches]
        }


    def canBeginTournament(self):
        return len(self.currentPlayers) in self.minPlayers

    def canStart(self):
        threshold = 0
        if len(self.currentPlayers) in self.minPlayers:
            threshold = self.minPlayers.index(len(self.currentPlayers))
            threshold = self.minRequiredReady[threshold]
        else:
            return False

        print(self.readiedPlayers)
        print(threshold)

        return (
            len(self.readiedPlayers) == threshold and
            not self.onGoingMatch
        )

    async def processInfo(self, data):
        playerObject = data.get("player")
        if data.get("command") is None:
            return (False, "Invalid command", 'invalid_command')

        command = data.get("command")
        match command:
            case "ready":
                return await self.readyUp(playerObject)
            case "unready":
                return await self.disReadyUp(playerObject)
            case _:
                return (False, "Invalid command", 'invalid_command')

    def createMatchUp(self, data):
        if (isinstance(data[0], list)):
            return MatchUps(self.createMatchUp(data[0]), self.createMatchUp(data[1]))
        return MatchUps(data[0], data[1])

    def determineMatchUps(self):
        temp = [player for player in self.currentPlayers]

        while (len(temp) != 1):
            random.shuffle(temp)
            half = len(temp) // 2
            first_half = [temp[x] for x in range(half)]
            second_half = [temp[x] for x in range(half, len(temp))]
            matchups = [[first_half[x], second_half[x]] for x in range(len(first_half))]

            temp = matchups

        self.innerMatchUps = self.createMatchUp(temp[0])
        print(self.innerMatchUps)

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

        # TODO: put a better timing ig?
        if not await self.delaySeconds(3, checkerFunction):
            return

        if not self.tournamentStarted:
            if not self.canBeginTournament():
                return
            # first initialization
            self.tournamentStarted = True
            self.completePlayers = [player for player in self.currentPlayers]
            self.expectedPlayers = [player for player in self.currentPlayers]
            self.determineMatchUps()

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
        self.readiedPlayers = []
        self.currentlyRunningMatches = []

    async def delaySeconds(self, duration, functionToRun=None):
        startTime = datetime.now()
        totalDuration = duration
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

        print("test")
        # delay 10 secs, then only remove
        await self.notify_ToRefresh()
        await self.delaySeconds(10, functionToRun=self.notify_End)
        print('test2')

        await self.removalFunction()

        await self.notify_kickEveryone()

    async def endMatch(self):
        print("One round of the tournament ended")

        # save the result
        currentResults = []
        currentMatchUps = self.innerMatchUps.getCurrentMatchUps()
        for matchUps in currentMatchUps:
            currentResults.append(matchUps.getMatchObject())
        self.completeResults.append(currentResults)

        # get next matchups 
        self.innerMatchUps.updateMatchUps()

        self.reset()
        if (len(self.currentPlayers) == 1):
            asyncio.create_task(self.endTournament())
        else:
            asyncio.create_task(self.startMatch())

    async def matchUp(self) -> None:
        matchups = self.innerMatchUps.getCurrentMatchUps()
        for matchup in matchups:
            gameId = await sync_to_async(PongServer.new_game) (
                expectedPlayers=matchup.getExpectedPlayers(),
            )

            # i have only myself to blame for this situation
            gameInstance = PongServer.getGameInstance(gameId)
            gameInstance.setRemovalFunction(self.collectData(gameInstance, matchup))
            # await gameInstance.startImmediately()

            self.currentlyRunningMatches.append(gameInstance)

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

        tournamentObject: Tournament = None

        try:
            tournamentObject = await Tournament.objects.aget(tournamentid=self.id)
        except ObjectDoesNotExist:
            print("what the fuck? tournamentID not found??")
            await self.panicRemove()
            return

        for player in self.completePlayers:
            try:
                player.tournament_played += 1
                if (player == self.winner):
                    self.winner.tournament_won += 1
                else:
                    player.tournament_lost += 1
                await player.asave()
            except ObjectDoesNotExist:
                print("well that person doesnt exist")
                if (player == self.winner):
                    print("Cant really have a non existant winner...")
                    await self.panicRemove()
                    return

        # create new tournamentResult
        # add winner and players in
        newTournamentResult = await TournamentResult.objects.acreate(
            winner=self.winner,
            tournament=tournamentObject
        )
        await newTournamentResult.players.aadd(*self.completePlayers)
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

    def collectData(self, gameInstance: PongGame, matchUpNode: MatchUps):
        async def function():
            gameId = gameInstance.gameid
            # remove game instance from Server
            await PongServer.createRemovalFunction(gameId)()

            matchObject = await Match.objects.aget(matchid=gameId)

            matchUpNode.setMatchObject(matchObject)

            winnerGetter = lambda : matchObject.result.winner
            winner = await sync_to_async(winnerGetter)()

            matchUpNode.setWinner(winner)

            loserGetter = lambda : matchObject.result.loser
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
                "players": PublicPlayerSerializer(self.currentPlayers, many=True).data,
                "ready": [player.username for player in self.readiedPlayers],
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
                "winner": PublicPlayerSerializer(self.winner).data,
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

