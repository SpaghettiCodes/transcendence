import random
from channels.layers import get_channel_layer
from .server import TournamentServer

class TournamentManager:
    servers: dict[str, TournamentServer] = {
        "abc": TournamentServer("abc"),
        "def": TournamentServer("def")
    }
    channel_layer = get_channel_layer()

    # random letter generator strikes again
    ran_letter = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    @classmethod
    def getAllDetails(cls):
        result = []
        for serversid, server in cls.servers.items():
            result.append(serversid)
        return result

    @classmethod
    async def player_join(cls, username, id):
        if id not in cls.servers.keys():
            return (False, "Tournament does not exist")
        
        success, message = await cls.servers[id].playerJoin(username)

        if not success:
            return (success, message)

        return (True, "Nothing to see here, move along")

    @classmethod
    async def player_left(cls, username, id):
        if id not in cls.servers.keys():
            return (False, "Tournament does not exist")

        await cls.servers[id].playerLeft(username)

        return (True, "Everything is fine")

    @classmethod
    async def new_tournament(cls, hidden=False):
        server_id = "".join(random.choices(cls.ran_letter, k=8))
        while server_id in cls.servers.keys():
            server_id = "".join(random.choices(cls.ran_letter, k=8))

        cls.servers[server_id] = TournamentServer(server_id, hidden)

        return server_id

    @classmethod
    def getTournamentJsonDetails(cls, id):
        if cls.servers.get(id) is None:
            return None
        return cls.servers[id].getDetails()

    @classmethod
    async def passInfo(cls, id, data):
        if cls.servers.get(id) is None:
            return (False, "Game not found")
        return await cls.servers[id].processInfo(data)
