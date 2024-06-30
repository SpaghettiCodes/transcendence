# surely i can use random
import random
from .pong.pong import PongGame
from channels.layers import get_channel_layer

class PongServer:
    queue = []
    servers = {"abc": PongGame("abc"), "def": PongGame("def", True), "ghi": PongGame("ghi", False, ["test1", "test2"])}

    channel_layer = get_channel_layer()

    # peak lazyness
    ran_letter = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    @classmethod
    def get_servers_list(cls):
        ret = []
        for server_id, server in cls.servers.items():
            if (not server.is_hidden()):
                ret.append(server.get_data())
        return ret

    @classmethod
    # most probably for random matchmaking
    # put on hold for now
    async def random_matchmake(cls):
        server_to_join = None

        if len(cls.servers):
            for server_id, server in cls.servers.items():
                # should not be able to join a hidden server, nor a server with player restriction, nor a server that already started playing
                if (not server.is_hidden() and not server.has_begin() and not server.is_restricted()):
                    server_to_join = server_id
                    break

        if server_to_join is None:
            server_to_join = await cls.new_game()

        print(f"Sending that guy to {server_to_join}")
        return server_to_join

    @classmethod
    async def join_player(cls, username, gameid):
        if gameid not in cls.servers.keys():
            return (False, "Game does not exist")

        res = await cls.servers[gameid].playerJoin(username)

        await cls.update_list()
        return res

    @classmethod
    async def new_spectator(cls, username, gameid):
        if gameid not in cls.servers.keys():
            return (False, "Game does not exist")

        res = cls.servers[gameid].spectatorJoin(username)

        await cls.update_list()
        return res

    @classmethod
    async def new_game(cls, hidden=False, expectedPlayers=[]):
        server_id = "".join(random.choices(cls.ran_letter, k=8))
        while server_id in cls.servers.keys():
            server_id = "".join(random.choices(cls.ran_letter, k=8))

        cls.servers[server_id] = PongGame(server_id, hidden, expectedPlayers)

        if not hidden:
            await cls.update_list()
        return server_id

    @classmethod
    def pass_info(cls, json_info, game_id):
        cls.servers[game_id].command(json_info)

    @classmethod
    async def player_left(cls, username, game_id):
        server = cls.servers[game_id]
        await server.playerLeft(username)
        if server.emptyLobby():
            await cls.stop_server(game_id)

        await cls.update_list()

    @classmethod
    async def stop_server(cls, game_id):
        await cls.servers[game_id].stop()
        cls.servers.pop(game_id)

        await cls.update_list()

    @classmethod
    async def update_list(cls):
        from match_list_ws.consumers import match_list_newsletter

        await cls.channel_layer.group_send(match_list_newsletter, {
                "type": "message",
                "text": cls.get_servers_list()
        })
