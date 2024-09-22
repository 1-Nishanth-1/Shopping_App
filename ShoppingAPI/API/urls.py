from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.urls import path, include
from . import views

urlpatterns = [

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('product/', views.ProductApi, name="product_API"),
    path('orders/', views.ordersApi, name="orders_API"),
    path('category/', views.CategoryApi, name="category_API"),
    path('cart/', views.CartApi, name="cart_API"),
    path('registration/', views.registration, name="registration"),
    path('verify/', views.verify, name="verify"),
    path('generatebill/',views.generate_bill, name="generate bill"),
    path("bill/",views.bill,name="bill"),
    path("reviews/",views.Reviews, name="reviews"),
    path("comments/",views.Comments, name="comments"),
    path("resetpassword/",views.ResetPasswordMail, name="reset password"),
]