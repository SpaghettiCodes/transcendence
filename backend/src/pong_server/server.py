# surely i can use random
import random
from .components.pong import PongGame
from channels.layers import get_channel_layer

class PongServer:
    queue = []
    server_ids = ["abc"]
    servers = {"abc": PongGame("abc")}

    channel_layer = get_channel_layer()

    # peak lazyness
    ran_letter = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    @classmethod
    def get_servers_list(cls):
        ret = []
        for server_id, server in cls.servers.items():
            ret.append(server.get_data())
        return ret

    @classmethod
    # most probably for random matchmaking
    # put on hold for now
    def new_player(cls, username):
        cls.queue.append(username)
        if not cls.server_ids or cls.servers[cls.server_ids[-1]].ready():
            cls.new_game()
        server_to_join = cls.server_ids[-1]
        cls.servers[server_to_join].playerJoin(username)
        cls.servers[server_to_join].start()

        print(f"Player {username} joined room {server_to_join}")
        return server_to_join

    @classmethod
    async def join_player(cls, username, gameid):
        if gameid not in cls.server_ids:
            return (False, "Game does not exist")

        res = await cls.servers[gameid].playerJoin(username)

        await cls.update_list()
        return res

    @classmethod
    async def new_spectator(cls, username, gameid):
        if gameid not in cls.server_ids:
            return (False, "Game does not exist")

        res = cls.servers[gameid].spectatorJoin(username)

        await cls.update_list()
        return res

    @classmethod
    async def new_game(cls):
        server_id = "".join(random.choices(cls.ran_letter, k=8))
        while server_id in cls.servers.keys():
            server_id = "".join(random.choices(cls.ran_letter, k=8))

        cls.servers[server_id] = PongGame(server_id)
        cls.server_ids.append(server_id)

        await cls.update_list()
        return server_id

    @classmethod
    def pass_info(cls, json_info):
        cls.servers[json_info["gameid"]].command(json_info)

    @classmethod
    async def player_left(cls, username, game_id):
        no_players = await cls.servers[game_id].playerLeft(username)
        if no_players:
            await cls.stop_server(game_id)

        await cls.update_list()

    @classmethod
    async def stop_server(cls, game_id):
        await cls.servers[game_id].stop()
        cls.server_ids.remove(game_id)
        cls.servers.pop(game_id)

        await cls.update_list()

    @classmethod
    async def update_list(cls):
        from match_list_ws.consumers import match_list_newsletter

        await cls.channel_layer.group_send(match_list_newsletter, {
                "type": "message",
                "text": cls.get_servers_list()
        })
