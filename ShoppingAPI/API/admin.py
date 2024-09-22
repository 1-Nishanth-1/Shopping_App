from django.contrib import admin
from .models import CustomUser, Product, order_History, ShoppingCart, category, Review, ReviewComment, Bill

admin.site.register(CustomUser)
admin.site.register(Product)
admin.site.register(order_History)
admin.site.register(ShoppingCart)
admin.site.register(category)
admin.site.register(Review)
admin.site.register(ReviewComment)
admin.site.register(Bill)