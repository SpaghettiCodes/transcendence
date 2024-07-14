from rest_framework import serializers
from database.models import Player, Match, ChatRoom, ChatMessages, MatchResult, Tournament, TournamentResult, TournamentRound
from util.base_converter import from_base52, to_base52

class PublicPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ("username", )

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class MatchResultSerializer(serializers.ModelSerializer):
    attacker = PublicPlayerSerializer()
    defender = PublicPlayerSerializer()

    winner = serializers.SlugRelatedField(queryset=Player, slug_field='username')
    loser = serializers.SlugRelatedField(queryset=Player, slug_field='username')

    reason = serializers.SerializerMethodField()

    class Meta:
        model = MatchResult
        fields = ("attacker", "defender", "attacker_score", "defender_score", "winner", "loser", "reason")

    def get_reason(self, obj):
        return obj.get_reason_display()

class MatchSerializer(serializers.ModelSerializer):
    result = MatchResultSerializer()

    class Meta:
        model = Match
        fields = ('matchid', 'time_played', 'status', 'result')

class TournamentRoundSerializer(serializers.ModelSerializer):
    match = serializers.SlugRelatedField(queryset=Match, many=True, slug_field='matchid')
    # match = MatchSerializer(many=True)

    class Meta:
        model = TournamentRound
        fields = ('roundNumber', 'match')

class TournamentResultSerializer(serializers.ModelSerializer):
    winner = PublicPlayerSerializer()
    players = serializers.SlugRelatedField(queryset=Player, many=True, slug_field='username')
    rounds = TournamentRoundSerializer(many=True)

    class Meta:
        model = TournamentResult
        fields = ('winner', 'players', 'rounds')

class TournamentSerializer(serializers.ModelSerializer):
    result = TournamentResultSerializer()

    class Meta:
        model = Tournament
        fields = ('tournamentid', 'time_played', 'status', 'result')

class ChatRoomSerializer(serializers.ModelSerializer):
    owner = PublicPlayerSerializer()
    members = PublicPlayerSerializer(many=True)
    # members = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), many=True)

    class Meta:
        model = ChatRoom
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    room = ChatRoomSerializer()
    sender = PublicPlayerSerializer()

    class Meta:
        model = ChatMessages
        fields = '__all__'
