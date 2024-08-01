from typing import Any
from django.db import models
from django.conf import settings
from django.utils import timezone
from passlib.hash import pbkdf2_sha256
from random import randint
import os

# Create your models here.
class Player(models.Model):
    username = models.CharField(max_length=35, unique=True, blank=False, null=False)
    password = models.CharField(max_length=256, blank=False, null=False)
    email = models.EmailField(max_length=100, unique=True, blank=True, null=True, default=None)
    profile_pic = models.ImageField(default="./firefly.png")
    date_joined = models.DateTimeField(auto_now_add=True)

    friends = models.ManyToManyField("Player", blank=True, related_name="friends_with")
    blocked = models.ManyToManyField("Player", blank=True, related_name="blocked_by")

    is_active = models.BooleanField(default=False)

    # hmmm
    pong_matches_played = models.PositiveIntegerField(default=0)
    pong_matches_won = models.PositiveIntegerField(default=0)
    pong_matches_lost = models.PositiveIntegerField(default=0)

    apong_matches_played = models.PositiveIntegerField(default=0)
    apong_matches_won = models.PositiveIntegerField(default=0)
    apong_matches_lost = models.PositiveIntegerField(default=0)

    tournament_played = models.PositiveIntegerField(default=0)
    tournament_won = models.PositiveIntegerField(default=0)
    tournament_lost = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f"User {self.username}"
    
    def encrypt_password(raw_password):
        return pbkdf2_sha256.hash(raw_password, rounds=12000, salt_size=32) 
        # encrypt is depreciated according to docs
        # also why is the object to be hashed called secret??? 
        # mf i thought secret is the "secret phrase" used to hash your password

    def verify_password(self, raw_password):
        return pbkdf2_sha256.verify(raw_password, self.password)

    def is_friends_with(self, player):
        return player in self.friends.all()

    def has_blocked(self, target):
        return target in self.blocked.all()

    def block_player(self, player):
        if not player in self.blocked.all():
            self.blocked.add(player)

            # remove friend
            if player in self.friends.all():
                self.friends.remove(player)
            if self in player.friends.all():
                player.friends.remove(self)

            self.save()

    def unblock_player(self, player):
        if player in self.blocked.all():
            self.blocked.remove(player)
            self.save()

    def add_friend(self, player):
        if not player in self.friends.all():
            self.friends.add(player)
            self.save()

    def remove_friend(self, player):
        if player in self.friends.all():
            self.friends.remove(player)
            self.save()

        if self in player.friends.all():
            player.friends.remove(self)
            player.save()

    def won_match(self):
        self.matches_won += 1

    def lost_match(self):
        self.matches_lost += 1
            
    def now_online(self):
        self.is_active = True
        self.save()
        
    def now_offline(self):
        self.is_active = False
        self.save()

    def has_tfa_activated(self):
        return self.email != None

class Friend_Request(models.Model):
    sender = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='friend_request_sender', 
        default=None
    )
    receiver = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='friend_request_receiver', 
        default=None
    )

    def __str__(self) -> str:
        return f"{self.sender} to {self.receiver}"

    def accept(self):
        receiver_player = Player.objects.get(username=self.receiver.username)
        if receiver_player:
            receiver_player.add_friend(self.sender)
            sender_player = Player.objects.get(username=self.sender.username)
            if sender_player:
                sender_player.add_friend(self.receiver)
                self.delete()

    def decline(self):
        self.delete()

    @classmethod
    def removeAllFriendRequest(cls, player1, player2):
        cls.objects.filter(sender=player1, receiver=player2).delete()
        cls.objects.filter(sender=player2, receiver=player1).delete()

class FourtyTwoAccount(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='fourty_two_account')
    intraID = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"Associated With IntraID - {self.intraID}"

class TwoFactorAuthentication(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player_tfa', default=None)
    code = models.CharField(blank=True, default='100000', max_length=6)
    used = models.BooleanField(default=False)
    lastGenerated = models.DateTimeField(auto_now_add=True)

    def generate_code(self):
        new_code = ''.join(["{}".format(randint(0, 9)) for _ in range(0, 6)])
        self.code = new_code
        self.used = False
        self.lastGenerated = timezone.now()
        self.save()

    def expired(self, maxDuration=300):
        # duration is 5 min by default
        timeNow = timezone.now()
        diffSecs = (timeNow - self.lastGenerated).seconds
        return diffSecs > maxDuration

    def verify_code(self, code):
        if int(code) == int(self.code) and not self.used:
            self.used = True
            self.save()
            return True
        else:
            return False

class Match(models.Model):
    id = models.BigAutoField(primary_key=True)
    matchid = models.CharField(max_length=8, unique=True, null=True, blank=True)
    time_played = models.DateTimeField(auto_now_add=True)

    type = models.SmallIntegerField(
        choices=(
            (1, "pong"),
            (2, "apong")
        ),
        default=1
    )

    status = models.SmallIntegerField(
        choices=(
            (1, "ongoing"),
            (2, "done")
        ),
        default=1,
    )

    related_tournament = models.ForeignKey(
        'TournamentRound',
        on_delete=models.CASCADE,
        related_name="match",
        null=True
    )

    def __str__(self) -> str:
        return f"Match id: {self.matchid}"

# needed cuz null values are discouraged
# andd we need a way to figure out the match id
class MatchResult(models.Model):
    attacker = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="match_attacker",
    )

    defender = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="match_defender",
    )

    attacker_score = models.IntegerField()
    defender_score = models.IntegerField()

    winner = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="match_winner"
    )

    loser = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="match_loser"
    )

    reason = models.SmallIntegerField(
        choices=(
            (1, "normal"),
            (2, "forfeited"),
            (3, 'draw')
        ),
        default=1
    )

    match = models.OneToOneField(
        Match,
        on_delete=models.CASCADE,
        related_name="result"
    )

    def __str__(self) -> str:
        return f"{self.attacker.username} vs {self.defender.username}"

class Tournament(models.Model):
    id = models.BigAutoField(primary_key=True)
    tournamentid = models.CharField(max_length=8, unique=True)
    time_played = models.DateTimeField(auto_now_add=True)

    status = models.SmallIntegerField(
        choices=(
            (1, 'ongoing'),
            (2, 'done')
        ),
        default=1,
    )

    def __str__(self) -> str:
        return f"Tournament id: {self.tournamentid}"

class TournamentResult(models.Model):
    winner = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="tour_winner"
    )

    players = models.ManyToManyField(
        Player,
        related_name="tour_participants",
    )

    tournament = models.OneToOneField(
        Tournament,
        on_delete=models.CASCADE,
        related_name="result"
    )

class TournamentRound(models.Model):
    roundNumber = models.SmallIntegerField()

    result = models.ForeignKey(
        TournamentResult,
        on_delete=models.CASCADE,
        related_name="rounds"
    )

class ChatRoom(models.Model):
    roomid = models.BigAutoField(primary_key=True)
    owner = models.ForeignKey(
        Player,
        on_delete=models.PROTECT,
        null=True,
        related_name="owner"
    ) # if owner is null, means its system that built it
    title = models.CharField(max_length=50)
    members = models.ManyToManyField(
        Player,
        related_name="member_of",
    )

class ChatMessage(models.Model):
    chatid = models.BigAutoField(primary_key=True)
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        Player,
        on_delete=models.PROTECT
    )
    type = models.SmallIntegerField(
        choices=(
            (1, "message"),
            (2, "invite")
        ),
        default=1
    )
    posted = models.DateTimeField(auto_now_add=True)
    content = models.CharField(max_length=200)

class InviteMessage(models.Model):
    status = models.SmallIntegerField(
        choices=(
            (1, "waiting"),
            (2, "done"),
            (3, "expired")
        ),
        default=1
    )

    match = models.OneToOneField(
        Match,
        on_delete=models.CASCADE,
        related_name="invite_match",
        null=True
    )

    chatMessage = models.OneToOneField(
        ChatMessage,
        on_delete=models.CASCADE,
        related_name='invite_details'
    )

    def __str__(self) -> str:
        if {self.match}:
            return f"Invitation for match {self.match}"
        else:
            return f"An expired invitation"
