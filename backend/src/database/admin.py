from django.contrib import admin

from . import models

# Register your models here.
admin.site.register(models.Player)
admin.site.register(models.Match)
admin.site.register(models.ChatRoom)
admin.site.register(models.ChatMessages)