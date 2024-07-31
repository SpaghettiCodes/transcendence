from .base.game import Game
from .pong.pong import PongGame
from .apongus.apongus import APongUsGame
from channels.layers import get_channel_layer
import asyncio
from asgiref.sync import sync_to_async, async_to_sync
from database.models import Match, Player, MatchResult
from util.base_converter import to_base52, from_base52
import datetime
from django.core.exceptions import ObjectDoesNotExist

class PongServer:
    servers: dict[str, Game] = {}
    pongQueue = []
    apongQueue = []

    channel_layer = get_channel_layer()

    @classmethod
    def getDetails(cls, game_id, ):
        return cls.servers[game_id].getDetails()

    @classmethod
    def get_servers_list(cls, ):
        ret = []
        for server_id, server in cls.servers.items():
            if (not server.is_hidden()):
                ret.append(server.get_data())
        return ret

    @classmethod
    # most probably for random matchmaking
    # put on hold for now
    def random_matchmake(cls, playerObject, type="pong"):
        server_to_join = None

        if len(cls.servers):
            try:
                for server_id, server in cls.servers.items():
                    # # should not be able to join a hidden server
                    # # nor a server with player restriction
                    # # nor a server that already started playing
                    # if (not server.is_hidden() and 
                    #     not server.has_begin() and 
                    #     not server.is_restricted() and
                    #     server.getType() == type
                    #     ):
                    #     server_to_join = server_id
                    #     break
                    print(server.expectedPlayers)
                    print(server.is_expected(playerObject))
                    if (server.getType() == type and 
                        server.is_expected(playerObject)):
                        server_to_join = server_id
                        break
            except RuntimeError: # fuckin size changing again
                return cls.random_matchmake(type)

        return server_to_join

    @classmethod
    def inMatchMaking(cls, playerUsername, type='pong'):
        queue = cls.pongQueue if type == 'pong' else cls.apongQueue
        return playerUsername in queue

    @classmethod
    def matchMaking(cls, playerUsername, type="pong"):
        if type == "pong" and playerUsername not in cls.pongQueue:
            cls.pongQueue.append(playerUsername)
            if len(cls.pongQueue) >= 2:
                firstTwoPlayers = cls.pongQueue[:2]
                cls.new_game(type=type, expectedPlayers=firstTwoPlayers)
        elif type == "apong" and playerUsername not in cls.apongQueue:
            cls.apongQueue.append(playerUsername)
            if len(cls.apongQueue) >= 2:
                firstTwoPlayers = cls.apongQueue[:2]
                cls.new_game(type=type, expectedPlayers=firstTwoPlayers)
        else:
            return False

        return True

    @classmethod
    def dismatchMaking(cls, playerUsername, type='pong'):
        print('disembarking')
        if type == "pong" and playerUsername in cls.pongQueue:
            cls.pongQueue.remove(playerUsername)
        elif type == "apong" and playerUsername in cls.apongQueue:
            cls.apongQueue.remove(playerUsername)
        else:
            return False

        return True

    @classmethod
    async def join_player(cls, playerObject, gameid, ):
        res = await cls.servers[gameid].playerJoin(playerObject)

        await cls.update_list()
        return res

    @classmethod
    async def new_spectator(cls, playerObject, gameid, ):
        res = cls.servers[gameid].spectatorJoin(playerObject)

        await cls.update_list()
        return res

    @classmethod
    def getNewServerID(cls, type):
        typeId = 1
        if type == 'apong':
            typeId = 2

        newMatch = Match.objects.create(type=typeId)
        matchId = newMatch.id
        displayId = to_base52(matchId)
        newMatch.matchid = displayId
        newMatch.save()

        return displayId

    @classmethod
    def new_game(
        cls, 
        removalFunction=None, 
        type="pong", 
        hidden=False, 
        expectedPlayers=[],
    ):
        server_id = cls.getNewServerID(type)

        if removalFunction is None:
            removalFunction = cls.createRemovalFunction(server_id)

        if type == "pong":
            cls.servers[server_id] = PongGame(server_id, removalFunction, hidden, expectedPlayers)
        elif type == "apong":
            cls.servers[server_id] = APongUsGame(server_id, removalFunction, hidden, expectedPlayers)
        else:
            print("Well that type does NOT exist")
            Match.objects.get(matchid=server_id).delete()
            return None

        if not hidden:
            async_to_sync(cls.update_list)()

        return server_id

    @classmethod
    def getGameInstance(cls, game_id, ):
        return cls.servers.get(game_id)

    @classmethod
    def createRemovalFunction(cls, game_id, ):
        async def removalFunction():
            gameInstance = cls.servers.pop(game_id)
            if not gameInstance.matchPlayed():
                matchObject = await Match.objects.aget(matchid=game_id)
                await matchObject.adelete()
            else:
                await gameInstance.uploadMatchResults()

            await cls.update_list()
        return removalFunction

    @classmethod
    def pass_info(cls, json_info, game_id, ):
        cls.servers[game_id].command(json_info)

    @classmethod
    async def player_left(cls, username, game_id, ):
        server = cls.servers.get(game_id)
        if (not server):
            print("Probably removed via removalFunction")
            return

        await server.playerLeft(username)

    @classmethod
    async def update_list(cls):
        # from pongList_ws.consumers import match_list_newsletter

        # await cls.channel_layer.group_send(match_list_newsletter, {
        #         "type": "message",
        #         "text": cls.get_servers_list()
        # })

        pass