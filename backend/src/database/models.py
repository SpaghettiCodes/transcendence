from django.db import models

# Create your models here.
class Player(models.Model):
    username = models.CharField(max_length=20, unique=True)

    def __str__(self) -> str:
        return self.username

class Match(models.Model):
    matchid = models.BigAutoField(primary_key=True)

    status = models.CharField(
        choices=(
            ("waiting", "Waiting"),
            ("done", "Done")
        ),
        initial='waiting'
    )

    attacker = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="attacker"
    )
    defender = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="defender"
    )
    time_played = models.DateTimeField()
    attacker_score = models.IntegerField()
    defender_score = models.IntegerField()

    def __str__(self) -> str:
        return f"{self.attacker.username} vs {self.defender.username}"

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
        related_name="members"
    )

class ChatMessages(models.Model):
    chatid = models.BigAutoField(primary_key=True)
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        Player,
        on_delete=models.PROTECT
    )
    posted = models.DateTimeField()
    content = models.CharField(max_length=200)
