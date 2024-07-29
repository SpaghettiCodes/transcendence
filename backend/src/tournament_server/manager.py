import random
from channels.layers import get_channel_layer
from .server import TournamentServer
from database.models import Tournament
from datetime import datetime
from util.base_converter import to_base52, from_base52
from asgiref.sync import sync_to_async, async_to_sync

class TournamentManager:
    servers: dict[str, TournamentServer] = {}
    channel_layer = get_channel_layer()

    # random letter generator strikes again
    ran_letter = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    @classmethod
    def randomMatchmake(cls):
        server_to_join = None
        
        if len(cls.servers):
            try:
                for server_id, server in cls.servers.items():
                    if (not server.isFull()):
                        if (not server.isHidden() and not server.hasStarted()):
                            server_to_join = server_id
                            break
            except RuntimeError:
                print("fucking list changing during runtime bah")
                return cls.randomMatchmake()

        if server_to_join is None:
            server_to_join = cls.new_tournament()
 
        return server_to_join

    @classmethod
    def getAllDetails(cls):
        result = []
        for serversid, server in cls.servers.items():
            result.append(serversid)
        return result

    @classmethod
    async def player_join(cls, playerObject, id):
        if id not in cls.servers.keys():
            return (False, "Tournament does not exist", '404')
        
        return await cls.servers[id].playerJoin(playerObject)

    @classmethod
    async def player_left(cls, playerObject, id):
        if id not in cls.servers.keys():
            return (False, "Tournament does not exist", '404')

        await cls.servers[id].playerLeft(playerObject)

        return (True, "Everything is fine", '')

    @classmethod 
    def getNewTournamentID(cls):
        newTournament = Tournament.objects.create()
        tournamentId = newTournament.id
        displayId = to_base52(tournamentId)
        newTournament.tournamentid = displayId
        newTournament.save()

        return displayId

    @classmethod
    def new_tournament(cls, hidden=False, removalFunction=None):
        server_id = cls.getNewTournamentID()

        if removalFunction is None:
            removalFunction = cls.generateRemovalFunction(server_id)
            print(removalFunction)

        cls.servers[server_id] = TournamentServer(server_id, removalFunction, hidden)

        async_to_sync(cls.update_list)()
        return server_id

    @classmethod
    def getTournamentJsonDetails(cls, id):
        if cls.servers.get(id) is None:
            return None
        return cls.servers[id].getDetails()

    @classmethod
    async def passInfo(cls, id, data):
        if cls.servers.get(id) is None:
            return (False, "Game not found", 'not_found')
        return await cls.servers[id].processInfo(data)

    # hm, ptsd
    @classmethod
    def generateRemovalFunction(cls, id):
        async def func():
            if cls.servers.get(id) is None:
                return False, "Game Not Found"

            serverInstance = cls.servers.pop(id)
            if not serverInstance.hasStarted():
                # remove
                await serverInstance.panicRemove()
            else:
                await serverInstance.uploadResults()

            await cls.update_list()
        return func

    @classmethod
    def get_server_list(cls):
        ret = []
        for tournamentId, tournamentInstance in cls.servers.items():
            if not tournamentInstance.isHidden():
                ret.append(tournamentInstance.get_data())
        return ret

    @classmethod
    async def update_list(cls):
        # from tournamentList_ws.consumers import tournament_list_newslatter

        # await cls.channel_layer.group_send(tournament_list_newslatter, {
        #         "type": "message",
        #         "text": cls.get_server_list()
        # })
        pass
