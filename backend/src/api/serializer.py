from rest_framework import serializers
from database.models import Player, Match, ChatRoom, ChatMessage, MatchResult, Tournament, TournamentResult, TournamentRound, InviteMessage
from database.models import Friend_Request
from util.base_converter import from_base52, to_base52

class PublicPlayerSerializer(serializers.ModelSerializer):
    friends = serializers.SlugRelatedField(queryset=Player, many=True, slug_field='username')

    class Meta:
        model = Player
        fields = ('username', 'email', 'profile_pic', 'is_active', 'matches_played', 'matches_won', 'matches_lost', 'friends')

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend_Request
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
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Match
        fields = ('matchid', 'time_played', 'status')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if (ret['status'] == 'done'):
            ret['result'] = MatchResultSerializer(instance.result).data
        return ret

class MatchIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ('matchid', )

class TournamentRoundSerializer(serializers.ModelSerializer):
    # match = serializers.SlugRelatedField(queryset=Match, many=True, slug_field='matchid')
    match = MatchSerializer(many=True)

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
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Tournament
        fields = ('tournamentid', 'time_played', 'status')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret['status'] == 'done':
            ret['result'] = TournamentResultSerializer(instance.result).data
        return ret

class ChatRoomIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ('roomid', )

class PublicChatRoomSerializer(serializers.ModelSerializer):
    memberNo = serializers.SerializerMethodField()

    def get_memberNo(self, obj):
        return len(obj.members.all() + 1)

    class Meta:
        model = ChatRoom
        fields = ('roomid', 'memberNo')

class ChatRoomSerializer(serializers.ModelSerializer):
    owner = PublicPlayerSerializer()
    members = PublicPlayerSerializer(many=True)
    # members = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), many=True)

    class Meta:
        model = ChatRoom
        fields = '__all__'

class InviteMessageSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = InviteMessage
        fields = ['status']

    def get_status(self, obj):
        return obj.get_status_display()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret['status'] != 'expired':
            ret['match'] = instance.match.matchid
        return ret

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = PublicPlayerSerializer()
    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.get_type_display()

    class Meta:
        model = ChatMessage
        fields = ['chatid', 'type', 'posted', 'sender', 'content']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret["type"] == 'invite':
            ret['invite_details'] = InviteMessageSerializer(instance.invite_details).data
        return ret

class ImageSerializer(serializers.Serializer):
    image = serializers.ImageField()