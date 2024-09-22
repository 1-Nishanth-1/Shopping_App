from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class CustomUser(AbstractUser):
    email_confirmed = models.BooleanField(default=False)
    email_token= models.CharField(default=uuid.uuid4, null=True, max_length=100)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

class category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category_name=models.CharField(max_length=300)
    date_created=models.DateTimeField(auto_now_add=True, editable=False)
    def __str__(self):
        return self.category_name

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_name=models.CharField(max_length=300)
    date_created=models.DateTimeField(auto_now_add=True, editable=False)
    product_desc=models.CharField(max_length=5000, null=True)
    product_price=models.IntegerField()
    product_category=models.ForeignKey(category, on_delete=models.SET_NULL, null=True)
    product_image=models.ImageField(upload_to = "product/images")
    product_desc = models.CharField(max_length=100000, null=True)
    Rating= models.DecimalField(default=0, decimal_places=2, max_digits=3)
    def __str__(self):
        return self.product_name

class ShoppingCart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date_created = models.DateTimeField(auto_now_add=True, editable=False)
    cart_product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_nos = models.IntegerField()
    cart_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.cart_user.username} - {self.cart_product.product_name}"


class order_History(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date_created=models.DateTimeField(auto_now_add=True, editable=False)
    orders_user=models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    orders_product=models.ForeignKey(Product, on_delete=models.DO_NOTHING)
    product_nos=models.IntegerField()
    def __str__(self):
        return self.orders_product.product_name

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    review_title=models.CharField(max_length=300, default="review")
    review_body=models.CharField(max_length=10000, null=True)
    product=models.ForeignKey(Product, on_delete=models.CASCADE)
    points=models.IntegerField(default=1)
    vote_users=models.ManyToManyField(CustomUser, related_name="upvotes", blank=True)
    date_created=models.DateTimeField(auto_now_add=True, editable=False)
    rating=models.IntegerField(default=3)
    def __str__(self):
        return f"{self.product.product_name} - {self.user.username}"
    
class ReviewComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    comment=models.CharField(max_length=10000)
    review=models.ForeignKey(Review, on_delete=models.CASCADE)
    points=models.IntegerField(default=1)
    date_created=models.DateTimeField(auto_now_add=True, editable=False)
    def __str__(self):
        return f"{self.review.product.product_name} - {self.user.username}"

class Bill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    bill=models.CharField(max_length=200)
    date_created=models.DateTimeField(auto_now_add=True, editable=False)
    total=models.IntegerField(default=100)
    def __str__(self):
        return f"{self.user.username} - {self.date_created}"
