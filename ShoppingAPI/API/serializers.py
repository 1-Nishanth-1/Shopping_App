from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model= CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model= category
        fields='__all__'


class ProductSerializer(serializers.ModelSerializer):
    product_category = serializers.PrimaryKeyRelatedField(queryset=category.objects.all())  # Use Category.objects.all() to fetch all categories

    class Meta:
        model = Product
        fields = '__all__'



class order_HistorySerializer(serializers.ModelSerializer):
    orders_product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = order_History
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['orders_product'] = ProductSerializer(instance.orders_product).data
        return representation

    def create(self, validated_data):
        orders_user = validated_data.pop('orders_user')
        orders_product = validated_data.pop('orders_product')
        product_nos = validated_data.pop('product_nos')

        instance = order_History.objects.create(
            orders_user=orders_user,
            orders_product=orders_product,
            product_nos=product_nos

        )

        return instance

class ShoppingCartSerializer(serializers.ModelSerializer):
    cart_product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = ShoppingCart
        fields = ['id', 'cart_product', 'product_nos', 'cart_user']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['cart_product'] = ProductSerializer(instance.cart_product).data
        return representation

    def create(self, validated_data):
        cart_user = validated_data.pop('cart_user')
        cart_product = validated_data.pop('cart_product')
        product_nos = validated_data.pop('product_nos')

        cart, created = ShoppingCart.objects.get_or_create(
            cart_user=cart_user,
            cart_product=cart_product,
            defaults={'product_nos': product_nos}
        )

        if not created:
            cart.product_nos += product_nos
            cart.save()

        return cart

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        if not user.email_confirmed:
            raise PermissionDenied("Email not verified.")
        
        token = super().get_token(user)
        token["staff"] = user.is_staff
        
        return token
    
class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model= Bill
        fields='__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = Review
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            validated_data['user'] = request.user
        return super().create(validated_data)
    
class ReviewCommentSerializer(serializers.ModelSerializer):
    user=serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    class Meta:
        model = ReviewComment
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            validated_data['user'] = request.user
        return super().create(validated_data)