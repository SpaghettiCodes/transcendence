from django.contrib import admin

from . import models

# Register your models here.
admin.site.register(models.Player)
admin.site.register(models.Match)
admin.site.register(models.MatchResult)
admin.site.register(models.Tournament)
admin.site.register(models.TournamentRound)
admin.site.register(models.TournamentResult)
admin.site.register(models.ChatRoom)
admin.site.register(models.ChatMessages)
