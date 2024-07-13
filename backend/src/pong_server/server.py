from .base.game import Game
from .pong.pong import PongGame
from .apongus.apongus import APongUsGame
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from database.models import Match

class PongServer:
    queue = []
    servers: dict[None | str, dict[str, Game]] = {
        None: {
            # "abc": PongGame("abc"),
            # "def": PongGame("def", True),
            # "ghi": PongGame("ghi", False, ["test1", "test2"]),
            # "jkl": APongUsGame("jkl")
        }
    }

    channel_layer = get_channel_layer()

    @classmethod
    def getDetails(cls, game_id, subserver_id=None):
        print(cls.servers)
        if cls.servers.get(subserver_id) is None:
            return
        subserver = cls.servers[subserver_id]

        return subserver[game_id].getDetails()

    @classmethod
    def get_servers_list(cls, subserver_id=None):
        if cls.servers.get(subserver_id) is None:
            return []
        subserver = cls.servers[subserver_id]

        ret = []
        for server_id, server in subserver.items():
            if (not server.is_hidden()):
                ret.append(server.get_data())
        return ret

    @classmethod
    # most probably for random matchmaking
    # put on hold for now
    async def random_matchmake(cls):
        server_to_join = None
        subserver = cls.servers[None]

        if len(cls.servers):
            for server_id, server in subserver.items():
                # should not be able to join a hidden server, nor a server with player restriction, nor a server that already started playing
                if (not server.is_hidden() and not server.has_begin() and not server.is_restricted()):
                    server_to_join = server_id
                    break

        if server_to_join is None:
            server_to_join = await cls.new_game()

        print(f"Sending that guy to {server_to_join}")
        return server_to_join

    @classmethod
    async def join_player(cls, username, gameid, subserver_id=None):
        if cls.servers.get(subserver_id) is None:
            return
        subserver = cls.servers[subserver_id]

        if gameid not in subserver.keys():
            return (False, "Game does not exist")

        res = await subserver[gameid].playerJoin(username)

        await cls.update_list()
        return res

    @classmethod
    async def new_spectator(cls, username, gameid, subserver_id=None):
        if cls.servers.get(subserver_id) is None:
            return
        subserver = cls.servers[subserver_id]

        if gameid not in subserver.keys():
            return (False, "Game does not exist")

        res = subserver[gameid].spectatorJoin(username)

        await cls.update_list()
        return res

    @classmethod
    async def getNewServerID(cls):
        # go and fuck yourself
        # server_id = "".join(random.choices(cls.ran_letter, k=8))
        # while server_id in subserver.keys():
        #     server_id = "".join(random.choices(cls.ran_letter, k=8))

        newId = Match()
        await newId.asave()

        return newId.matchid

    @classmethod
    async def new_game(
        cls, 
        removalFunction=None, 
        type="pong", 
        hidden=False, 
        expectedPlayers=[], 
        subserver_id=None
    ):
        if (cls.servers.get(subserver_id) is None):
            cls.servers[subserver_id] = dict()
        subserver = cls.servers[subserver_id]

        server_id = await cls.getNewServerID()

        if removalFunction is None:
            removalFunction = cls.createRemovalFunction(server_id, subserver_id)

        if type == "pong":
            subserver[server_id] = PongGame(server_id, removalFunction, subserver_id, hidden, expectedPlayers)
        elif type == "apong":
            subserver[server_id] = APongUsGame(server_id, removalFunction, subserver_id, hidden, expectedPlayers)
        else:
            return None

        if not hidden:
            await cls.update_list()
        return server_id

    @classmethod
    def getGameInstance(cls, game_id, subserver_id):
        if (cls.servers.get(subserver_id) is None):
            return None
        subserver = cls.servers[subserver_id]

        return subserver.get(game_id)

    @classmethod
    def createRemovalFunction(cls, game_id, subserver_id):
        async def removalFunction():
            if cls.servers.get(subserver_id) is None:
                return
            subserver = cls.servers[subserver_id]

            subserver.pop(game_id)

            if subserver_id is not None and not len(subserver):
                cls.servers.pop(subserver_id)

            await cls.update_list()
        return removalFunction

    @classmethod
    def pass_info(cls, json_info, game_id, subserver_id=None):
        if cls.servers.get(subserver_id) is None:
            return

        subserver = cls.servers[subserver_id]
        subserver[game_id].command(json_info)

    @classmethod
    async def player_left(cls, username, game_id, subserver_id=None):
        if cls.servers.get(subserver_id) is None:
            return
        subserver = cls.servers[subserver_id]

        server = subserver.get(game_id)
        if (not server):
            print("Probably a funny bug happened")
            return

        await server.playerLeft(username)

    @classmethod
    async def update_list(cls):
        from match_list_ws.consumers import match_list_newsletter

        await cls.channel_layer.group_send(match_list_newsletter, {
                "type": "message",
                "text": cls.get_servers_list()
        })

