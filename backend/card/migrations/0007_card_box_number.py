# Generated by Django 3.2.7 on 2021-10-10 05:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('card', '0006_alter_card_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='box_number',
            field=models.IntegerField(default=0),
        ),
    ]
