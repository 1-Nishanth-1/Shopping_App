# Generated by Django 5.0.6 on 2024-07-09 04:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0019_bill_total'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='rating',
            field=models.IntegerField(default=3),
        ),
    ]
