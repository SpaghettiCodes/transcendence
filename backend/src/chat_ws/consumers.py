from channels.generic.websocket import AsyncJsonWebsocketConsumer
from database.models import ChatRoom, ChatMessages, Player
from asgiref.sync import sync_to_async
from api.serializer import ChatRoomSerializer
import datetime

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.roomid = self.scope['url_route']['kwargs']['roomid']
        self.room_name = f"chat-{self.roomid}"
        self.registered = False

        # check if roomid exist
        try:
            self.chatObject = await sync_to_async(ChatRoom.objects.get)(roomid=self.roomid)
        except Exception as e:
            print(e)
            self.disconnect_when_connecting()
            return

        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_name, self.channel_name
        )

    def get_serialized_data(self):
        serialized = ChatRoomSerializer(self.chatObject)
        return serialized.data

    async def send_status(self):
        await self.send_json({
            "status": "details",
            "details": await sync_to_async(self.get_serialized_data)()
        })

    async def new_connection(self, username):
        # get user
        try:
            userObject = await sync_to_async(Player.objects.get)(username=username)
        except Exception as e:
            # fuck u mean doesnt exist
            await self.send_json({
                "status": "error",
                "message": "Who are you?"
            })
            return await self.close()

        # check if username is part of the group
        # if its not, boot the fuck out
        if (await sync_to_async(self.check)(userObject)):
            await self.send_json({
                "status": "error",
                "message": "You arent Invited!"
            })
            return await self.close()

        self.username = username
        self.registered = True

        await self.channel_layer.group_add(
            self.room_name, self.channel_name
        )
        await self.send_status()
        print("ready to transmit messages")

    def check(self, userObject):
        return (self.chatObject.owner != userObject and userObject not in self.chatObject.members.all())

    async def receive_json(self, content, **kwargs):
        print(content)
        if content.get('command'):
            command = content['command']
            match command:
                case 'join':
                    await self.new_connection(content['username'])
        else:
            if self.registered:
                await sync_to_async(self.save_message_to_database)(content)
                await self.channel_layer.group_send(self.room_name, {
                    "type": "message",
                    "text": content
                })

    def save_message_to_database(self, content):
        room = self.chatObject
        sender = Player.objects.get(username=content["sender"])
        posted = datetime.datetime.now()
        content = content["message"]

        newMessage = ChatMessages(room=room, sender=sender, posted=posted, content=content)
        newMessage.save()

    async def message(self, event):
        if (self.registered):
            try:
                await self.send_json(event["text"])
            except Exception as e:
                print(e.args[0])

    async def disconnect_when_connecting(self):
        await self.accept()
        await self.close()