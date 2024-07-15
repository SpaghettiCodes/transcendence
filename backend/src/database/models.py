from typing import Any
from django.db import models
from django.conf import settings
from django.utils import timezone
from passlib.hash import pbkdf2_sha256
import os

# Create your models here.
class Player(models.Model):
    username = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=256, blank=True)
    email = models.EmailField(max_length=100, unique=True)
    profile_pic = models.ImageField(default="./firefly.png", blank=True)
    friends = models.ManyToManyField("Player", blank=True)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    matches_played = models.PositiveIntegerField(blank=True, default=0)
    matches_won = models.PositiveIntegerField(blank=True, default=0)
    matches_lost = models.PositiveIntegerField(blank=True, default=0)
    match_history = models.ManyToManyField("Match", blank=True)

    def __str__(self) -> str:
        return self.username
    
    def encrypt_password(raw_password):
        return pbkdf2_sha256.encrypt(raw_password, rounds=12000, salt_size=32)
    
    def verify_password(self, raw_password):
        return pbkdf2_sha256.verify(raw_password, self.password)
    
    def add_friend(self, player):
        if not player in self.friends.all():
            self.friends.add(player)
            self.save()

    def remove_friend(self, player):
        if player in self.friends.all():
            self.friends.remove(player)
            
    def won_match(self):
        self.matches_won += 1

    def lost_match(self):
        self.matches_lost += 1

    def add_match_history(self, match):
        if not match in self.match_history.all():
            self.match_history.add(match)
            self.matches_played += 1
            self.save()
            
    def now_online(self):
        self.is_active = True
        self.save()
        
    def now_offline(self):
        self.is_active = False
        self.save()

class Friend_Request(models.Model):
    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sender', default=None)
    receiver = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='receiver', default=None)
    is_active = models.BooleanField(blank=True, null=False, default=True)

    def __str__(self) -> str:
        return f"{self.sender} to {self.receiver}"

    def accept(self):
        receiver_player = Player.objects.get(username=self.receiver.username)
        if receiver_player:
            receiver_player.add_friend(self.sender)
            sender_player = Player.objects.get(username=self.sender.username)
            if sender_player:
                sender_player.add_friend(self.receiver)
                self.is_active = False
                self.save()

    def decline(self):
        self.is_active = False
        self.save()

class Tournament(models.Model):
    name = models.CharField(max_length=40, unique=True, blank=True)
    players = models.ManyToManyField("Player", blank=True)
    matches = models.ManyToManyField("Match", blank=True)
    
    def __str__(self) -> str:
        return self.name
    
    def is_full_tournament(number):
        return (number and (not(number & (number - 1))))
        
    
class Match(models.Model):
    id = models.BigAutoField(primary_key=True)
    matchid = models.CharField(max_length=8, unique=True, null=True, blank=True)
    time_played = models.DateTimeField()

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
            (2, "player Forfeited")
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
    time_played = models.DateTimeField()

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
        related_name="owner"
    )
    title = models.CharField(max_length=50)
    members = models.ManyToManyField(
        Player,
        related_name="members",
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
            (1, "normal"),
            (2, "invite")
        ),
        default=1
    )
    posted = models.DateTimeField()
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

    match = models.ForeignKey(
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