# Generated by Django 5.0.6 on 2024-07-05 11:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0014_remove_review_star_remove_reviewcomment_star'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='star',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='reviewcomment',
            name='star',
            field=models.IntegerField(default=0),
        ),
    ]
