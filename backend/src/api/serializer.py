from rest_framework import serializers
from database.models import Player
from database.models import Match

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