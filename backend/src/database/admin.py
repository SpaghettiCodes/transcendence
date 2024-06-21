from django.contrib import admin

from . import models

# Register your models here.
admin.site.register(models.Player)
admin.site.register(models.Friend_Request)
admin.site.register(models.Match)