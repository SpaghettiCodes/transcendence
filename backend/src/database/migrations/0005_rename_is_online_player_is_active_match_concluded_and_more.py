# Generated by Django 4.1 on 2024-07-15 08:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0004_alter_player_profile_pic'),
    ]

    operations = [
        migrations.RenameField(
            model_name='player',
            old_name='is_online',
            new_name='is_active',
        ),
        migrations.AddField(
            model_name='match',
            name='concluded',
            field=models.BooleanField(blank=True, default=False),
        ),
        migrations.AddField(
            model_name='player',
            name='match_history',
            field=models.ManyToManyField(blank=True, to='database.match'),
        ),
        migrations.AddField(
            model_name='player',
            name='matches_lost',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AddField(
            model_name='player',
            name='matches_played',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AddField(
            model_name='player',
            name='matches_won',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AlterField(
            model_name='match',
            name='attacker_score',
            field=models.IntegerField(blank=True, default=0),
        ),
        migrations.AlterField(
            model_name='match',
            name='defender_score',
            field=models.IntegerField(blank=True, default=0),
        ),
        migrations.AlterField(
            model_name='match',
            name='time_played',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=40, unique=True)),
                ('matches', models.ManyToManyField(blank=True, to='database.match')),
                ('players', models.ManyToManyField(blank=True, to='database.player')),
            ],
        ),
    ]
