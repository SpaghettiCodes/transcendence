from django.db import models

# Create your models here.
class Player(models.Model):
    username = models.CharField(max_length=20, unique=True)

    def __str__(self) -> str:
        return self.username

class Match(models.Model):
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

