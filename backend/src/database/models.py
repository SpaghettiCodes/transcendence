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
    is_online = models.BooleanField(default=False)
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

class Match(models.Model):
    attacker = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="attacker")
    defender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="defender")
    time_played = models.DateTimeField(blank=True, null=True)
    attacker_score = models.IntegerField(blank=True, default=0)
    defender_score = models.IntegerField(blank=True, default=0)
    concluded = models.BooleanField(blank=True, null=False, default=False)

    def __str__(self) -> str:
        return f"{self.attacker.username} [{self.attacker_score}] vs [{self.defender_score}] {self.defender.username}"
    
    def get_attacker_score(self):
        return self.attacker_score
    
    def get_defender_score(self):
        return self.defender_score
    
    def update_player_match_history(self):
        attacker_player = Player.objects.get(username=self.attacker.username)
        defender_player = Player.objects.get(username=self.defender.username)
        if attacker_player and defender_player:
            attacker_player.add_match_history(self)
            defender_player.add_match_history(self)
            if self.attacker_score > self.defender_score:
                attacker_player.won_match()
                defender_player.lost_match()
            elif self.attacker_score > self.defender_score:
                attacker_player.lost_match()
                defender_player.won_match()

