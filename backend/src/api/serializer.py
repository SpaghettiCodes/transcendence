from rest_framework import serializers
from database.models import Player, Match, ChatRoom

class PublicPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ("username", )

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    attacker = PublicPlayerSerializer()
    defender = PublicPlayerSerializer()

    class Meta:
        model = Match
        fields = '__all__'

class ChatRoomSerializer(serializers.ModelSerializer):
    owner = PublicPlayerSerializer()
    members = PublicPlayerSerializer(many=True)
    # members = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), many=True)

    class Meta:
        model = ChatRoom
        fields = '__all__'