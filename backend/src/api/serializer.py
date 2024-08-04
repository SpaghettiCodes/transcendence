from rest_framework import serializers
from database.models import Player, Match, ChatRoom, ChatMessage, MatchResult, Tournament, TournamentResult, TournamentRound, InviteMessage
from database.models import Friend_Request
from util.base_converter import from_base52, to_base52

class PublicPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ('username', 'profile_pic', 'is_online')

class PublicPlayerDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = (
                    'username', 
                    'profile_pic', 
                    'is_online', 
                    'pong_matches_played',
                    'pong_matches_won',
                    'pong_matches_lost',
                    'apong_matches_played',
                    'apong_matches_won',
                    'apong_matches_lost',
                    'tournament_played',
                    'tournament_won',
                    'tournament_lost',
                )

class PlayerCreator(serializers.ModelSerializer):

    def validate_username(self, username):
        for character in username:
            if character.isspace():
                raise serializers.ValidationError('No whitespaces in username')
            if not character.isalnum():
                if character != '-' and character != '_':
                    raise serializers.ValidationError('No symbols in username, except for - and _')
        return username

    class Meta:
        model = Player
        fields = ('username', 'password')

class ModifiableFieldsPlayer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = (
                    'password',
                    'email',
                    'profile_pic',
                )

class PlayerSerializer(serializers.ModelSerializer):
    friends = serializers.SlugRelatedField(queryset=Player, many=True, slug_field='username')

    class Meta:
        model = Player
        fields = (
                    'username', 
                    'email',
                    'profile_pic', 
                    'is_online', 
                    'pong_matches_played',
                    'pong_matches_won',
                    'pong_matches_lost',
                    'apong_matches_played',
                    'apong_matches_won',
                    'apong_matches_lost',
                    'tournament_played',
                    'tournament_won',
                    'tournament_lost',
                    'friends'
                )

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(queryset=Player, slug_field='username')
    receiver = serializers.SlugRelatedField(queryset=Player, slug_field='username')

    class Meta:
        model = Friend_Request
        fields = ('sender', 'receiver')

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
    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.get_type_display()

    def get_status(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Match
        fields = ('matchid', 'time_played', 'status', 'type')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if (ret['status'] == 'done'):
            ret['result'] = MatchResultSerializer(instance.result).data
        return ret

class TournamentRoundSerializer(serializers.ModelSerializer):
    # match = serializers.SlugRelatedField(queryset=Match, many=True, slug_field='matchid')
    match = MatchSerializer(many=True)

    class Meta:
        model = TournamentRound
        fields = ('roundNumber', 'match')

class TournamentResultSerializer(serializers.ModelSerializer):
    winner = PublicPlayerSerializer()
    players = PublicPlayerSerializer(many=True)
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
        return len(obj.members.all()) + (obj.owner != None)

    class Meta:
        model = ChatRoom
        fields = ('roomid', 'title', 'memberNo')

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
            ret['match'] = MatchSerializer(instance.match).data
        return ret

class ChatMessageSaver(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['room', 'type', 'sender', 'content']

class ChatMessageSerializer(serializers.ModelSerializer):
    def __init__(self, playerObject, instance=None, **kwargs):
        super().__init__(instance, **kwargs)
        self.player = playerObject

    sender = PublicPlayerSerializer()
    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.get_type_display()

    class Meta:
        model = ChatMessage
        fields = ['chatid', 'type', 'posted', 'sender', 'content']

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        # check if sender is blocked
        if instance.sender in self.player.blocked.all():
            ret['type'] = 'blocked'
            ret['content'] = 'You blocked this user and thus, cannot see the content of the message'
        elif instance.get_type_display() == 'invite':
            ret['invite_details'] = InviteMessageSerializer(instance.invite_details).data
        return ret

class ImageSerializer(serializers.Serializer):
    image = serializers.ImageField()