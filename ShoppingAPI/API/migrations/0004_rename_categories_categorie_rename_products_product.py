# Generated by Django 5.0.6 on 2024-06-28 06:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0003_categories_products_order_history_shoppingcart'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='categories',
            new_name='categorie',
        ),
        migrations.RenameModel(
            old_name='Products',
            new_name='Product',
        ),
    ]
