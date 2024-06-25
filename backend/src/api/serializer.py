from rest_framework import serializers
from database.models import Player
from database.models import Friend_Request
from database.models import Match

class PublicPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    friends = serializers.StringRelatedField(many=True)

    class Meta:
        model = Player
        fields = '__all__'

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend_Request
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    attacker = PublicPlayerSerializer()
    defender = PublicPlayerSerializer()

    class Meta:
        model = Match
        fields = '__all__'
        
class ImageSerializer(serializers.Serializer):
    image = serializers.ImageField()