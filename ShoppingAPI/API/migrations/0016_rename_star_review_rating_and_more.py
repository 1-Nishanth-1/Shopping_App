# Generated by Django 5.0.6 on 2024-07-05 11:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0015_review_star_reviewcomment_star'),
    ]

    operations = [
        migrations.RenameField(
            model_name='review',
            old_name='star',
            new_name='rating',
        ),
        migrations.RenameField(
            model_name='reviewcomment',
            old_name='star',
            new_name='rating',
        ),
    ]
