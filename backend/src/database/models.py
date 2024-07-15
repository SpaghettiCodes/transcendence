from typing import Any
from django.db import models

# Create your models here.
class Player(models.Model):
    username = models.CharField(max_length=20, unique=True)

    def __str__(self) -> str:
        return self.username

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