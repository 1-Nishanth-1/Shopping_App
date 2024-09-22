from django.shortcuts import render
from rest_framework.response import Response
from .models import *
from .serializers import *
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import HttpResponse
from django.db.models import Sum, Avg
from .permissions import IsAdminOrReadOnly
from datetime import date
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from io import BytesIO
import uuid
from xhtml2pdf import pisa
from .models import ShoppingCart
import os
from rest_framework.pagination import PageNumberPagination
def orders_pdf(template_path, context):
    html = render_to_string(template_path, context)

    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("utf-8")), result)

    if not pdf.err:
        pdf_file_dir = os.path.join('media', 'bill')
        pdf_file_path = os.path.join(pdf_file_dir, f'bill_{context["id"]}.pdf')

        os.makedirs(pdf_file_dir, exist_ok=True)

        with open(pdf_file_path, 'wb') as f:
            f.write(result.getvalue())

        data = {
            "id": context["id"],
            "bill": pdf_file_path,
            "user": context["user"].id,
            "total": context["total_amount"],
        }
        serializer = BillSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

        response = HttpResponse(result.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'inline; filename="bill.pdf"'
        return response

    return HttpResponse("Error rendering PDF", status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_bill(request):
    user = request.user
    print(f"Generating bill for user: {user.username}, ID: {user.id}")

    cart_items = ShoppingCart.objects.filter(cart_user=user)

    total = 0
    for item in cart_items:
        item.subtotal = item.cart_product.product_price * item.product_nos
        total += item.subtotal

    context = {
        "user": user,
        "cart": cart_items,
        "date": date.today(),
        "total_amount": total,
        "id": uuid.uuid4()
    }
    
    template_path = "pdf/bill.html" 
    return orders_pdf(template_path, context)
@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def ProductApi(request):

    if request.method == "GET":
        data = request.GET
        if data.get('id'):
            try:
                search_result = Product.objects.get(id=data.get('id'))
                serializer = ProductSerializer(search_result, many=False)
                return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)
            except Product.DoesNotExist:
                return Response({"msg": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        search_result = Product.objects.all()

        name = data.get('name')
        category = data.get('category')
        min_price = data.get('min_price')
        max_price = data.get('max_price')

        if name:
            search_result = search_result.filter(product_name__icontains=name)
        if category:
            search_result = search_result.filter(product_category__category_name__icontains=category)
        if min_price:
            search_result = search_result.filter(product_price__gte=min_price)
        if max_price:
            search_result = search_result.filter(product_price__lte=max_price)

        serializer = ProductSerializer(search_result, many=True)
        return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)

    elif request.method=="POST":
        if not request.user.is_staff:
            return Response({"msg": "Fail", "error": "Only admin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
    
        serializer=ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg":"success","data":serializer.data},status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)
        return Response({"msg":"Fail","data":serializer.data},status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method=="PATCH":
        if not request.user.is_staff:
            return Response({"msg": "Fail", "error": "Only admin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        product=Product.objects.get(pk=request.data.get('id'))
        serializer=ProductSerializer(product,data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg":"success","data":serializer.data},status=status.HTTP_200_OK)
        else:
            print(serializer.errors)
        return Response({"msg":"Fail","data":serializer.data},status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method=="DELETE":
        if not request.user.is_staff:
            return Response({"msg": "Fail", "error": "Only admin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        product=Product.objects.get(pk=request.data.get('id'))
        product.delete()
        return Response({"msg":"success"},status=status.HTTP_200_OK)
    
    return Response({"msg":"Fail"},status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def CategoryApi(request):
    if request.method == "GET":
        categories = category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        if not request.user.is_staff:
            return Response({"msg": "Fail", "error": "Only admin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "PATCH":
        if not request.user.is_staff:
            return Response({"msg": "Fail", "error": "Only admin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            category_instance = category.objects.get(pk=request.data.get('id'))
        except category.DoesNotExist:
            return Response({"msg": "Fail", "error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CategorySerializer(category_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        if not request.user.is_staff:
            return Response({"msg": "Fail", "error": "Only admin can perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            category_instance = category.objects.get(pk=request.data.get('id'))
        except category.DoesNotExist:
            return Response({"msg": "Fail", "error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        
        category_instance.delete()
        return Response({"msg": "success"}, status=status.HTTP_200_OK)

    return Response({"msg": "Fail"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def ordersApi(request):
    user = request.user
    data = request.data.copy()
    
    if request.method == "GET":
        orders = order_History.objects.filter(orders_user=user).order_by('-date_created')
        serializer = order_HistorySerializer(orders, many=True)
        return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        data['orders_user'] = user.id
        serializer = order_HistorySerializer(data=data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
        
        return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def CategoryApi(request):

    if request.method=="GET":
        Category = category.objects.all()
        serializer=CategorySerializer(Category, many=True)
        return Response({"msg":"success","data":serializer.data},status=status.HTTP_200_OK)
    
    elif request.method=="POST":
        serializer=CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg":"success","data":serializer.data},status=status.HTTP_201_CREATED)
        return Response({"msg":"Fail","data":serializer.data},status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method=="PATCH":
        Category=category.objects.get(pk=request.data.get('id'))
        serializer=CategorySerializer(Category,data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg":"success","data":serializer.data},status=status.HTTP_200_OK)
        return Response({"msg":"Fail","data":serializer.data},status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method=="DELETE":
        Category=category.objects.get(pk=request.data.get('id'))
        Category.delete()
        return Response({"msg":"success"},status=status.HTTP_200_OK)
    return Response({"msg":"Fail"},status=status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def CartApi(request):
    user=request.user
    if request.method=="GET":
        cart = ShoppingCart.objects.filter(cart_user=user)
        serializer=ShoppingCartSerializer(cart, many=True)
        sum=0
        count=cart.count()
        for i in serializer.data:
            sum+=(i.get('cart_product')).get('product_price')*i.get('product_nos')
        return Response({"msg":"success","data":serializer.data, "sum":sum, "count":count},status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        data = request.data
        data["cart_user"]=user.id
        print("Received data:", data)
        cart_item = ShoppingCart.objects.filter(cart_user=user, cart_product=data.get('cart_product')).first()

        if cart_item:
            cart_item.product_nos += data.get('product_nos')
            cart_item.save()
            serializer = ShoppingCartSerializer(cart_item)
            return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            serializer = ShoppingCartSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
            else:
                print("Validation errors:", serializer.errors)
                return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


    elif request.method=="PATCH":
        data=request.data
        if (data.get('product_nos')<=1):
            data['product_nos']=1
        print(data)
        cart=ShoppingCart.objects.get(pk=request.data.get('id'))
        serializer=ShoppingCartSerializer(cart,data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg":"success","data":serializer.data},status=status.HTTP_200_OK)
        return Response({"msg":"Fail","data":serializer.data},status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method=="DELETE":
        cart=ShoppingCart.objects.get(pk=request.data.get('id'))
        cart.delete()
        return Response({"msg":"success"},status=status.HTTP_200_OK)
    return Response({"msg":"Fail"},status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def registration(request):
    data = request.data
    if CustomUser.objects.filter(email=data.get('email')).exists():
        return Response({"msg": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        try:
            id = serializer.data.get('id')
            user = CustomUser.objects.get(id=id)
            token = user.email_token
            verification_link = f"http://127.0.0.1:8000/api/verify/?token={token}"  
            send_mail(
                subject="Email Verification",
                message=f"Click the link to verify your email: {verification_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[data.get('email')],
            )
        except Exception as e:
            print(f"Error sending email: {e}")
            return Response({"msg": "User created but email failed to send", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bill(request):
    user=request.user
    if request.method == "GET":
        try:
            bills = Bill.objects.filter(user=user).order_by('-date_created')
            paginator = PageNumberPagination()
            paginated_bills = paginator.paginate_queryset(bills, request)
            serializer = BillSerializer(paginated_bills, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({"msg": f"Error fetching bills: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"msg": "Fail"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)        

def verify(request):
    try:
        token = request.GET["token"]
        user = CustomUser.objects.get(email_token=token)

        new_token = uuid.uuid4()
        user.email_token = new_token
        user.email_confirmed = True
        user.save()
        return HttpResponse("Email verification successful!")

    except CustomUser.DoesNotExist:
        return HttpResponse("Invalid token or user does not exist.")  
    
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}")
    
@permission_classes([IsAuthenticated])
@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def Reviews(request):
    user = request.user

    if request.method == "GET":
        product = request.GET.get("product")
        reviews = Review.objects.filter(product=product).order_by('-points')
        serializer = ReviewSerializer(reviews, many=True)
        print(serializer.data)
        return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        data = request.data.copy()
        data["user"] = user.id
        data["vote_users"] = [user.id]
        print(data)
        serializer = ReviewSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            avg = Review.objects.filter(product=data.get('product')).aggregate(Avg('rating'))['rating__avg']
            avg = round(avg, 2)
            product = Product.objects.get(id=data.get('product'))
            product_data = {"Rating": avg}
            product_serializer = ProductSerializer(product, data=product_data, partial=True)
            if product_serializer.is_valid():
                product_serializer.save()
                return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
            else:
                print(product_serializer.errors)
                return Response({"msg": "Fail", "errors": product_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print(serializer.errors)
            return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    
    elif request.method == 'PATCH':
        review_id = request.data.get('id')
        if not review_id:
            return Response({"msg": "Review ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(pk=review_id)
        except Review.DoesNotExist:
            return Response({"msg": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
        
        user_id = request.data.get('vote_users')
        points = request.data.get('points')

        if points == 1:
            review.vote_users.add(user_id)
        elif points == -1:
            review.vote_users.remove(user_id)
        review.points += points
        review.save()
        data=request.data
        if(request.data.get('rating')):
            serializer = ReviewSerializer(review, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"msg": "success"}, status=status.HTTP_200_OK)
        
    elif request.method == "DELETE":
        review_id = request.data.get('id')
        if not review_id:
            return Response({"msg": "Review ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.get(pk=review_id)
        review.delete()

@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def Comments(request):

    user = request.user

    if request.method == "GET":
        review = request.GET.get("review")
        Comments = ReviewComment.objects.filter(review=review)
        paginator = PageNumberPagination()
        paginator.page_size = 5 
        paginated_comments = paginator.paginate_queryset(Comments, request)
        serializer = ReviewCommentSerializer(paginated_comments, many=True)
        return paginator.get_paginated_response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()
        data["user"] = user.id
        print(data)
        serializer = ReviewCommentSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == "PATCH":
        comment_id = request.data.get('id')
        if not comment_id:
            return Response({"msg": "Comment ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        comment = ReviewComment.objects.get(pk=comment_id)
        serializer = ReviewCommentSerializer(comment, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        
        return Response({"msg": "Fail", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == "DELETE":
        comment_id = request.data.get('id')
        if not comment_id:
            return Response({"msg": "Comment ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        comment = ReviewComment.objects.get(pk=comment_id)
        comment.delete()
        return Response({"msg": "success"}, status=status.HTTP_200_OK)
    
    return Response({"msg": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST', 'PATCH'])
def ResetPasswordMail(request):
    if request.method == "POST":
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
            if not user.email_confirmed:
                return Response({"msg": "Email not verified"}, status=status.HTTP_403_FORBIDDEN)
            
            # Generate new email token
            new_token = uuid.uuid4()
            user.email_token = new_token
            user.save()
            
            reset_link = f"http://localhost:5173/newpassword/{new_token}"
            send_mail(
                subject="Reset Password",
                message=f"Click the link to reset your password: {reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
            )
            return Response({"msg": "Email sent successfully"}, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({"msg": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"msg": f"Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH':
        token = request.data.get('token')
        try:
            user = CustomUser.objects.get(email_token=token)
            new_token = uuid.uuid4()
            user.email_token = new_token
            user.save()
            data = {
                "password": request.data.get('password')
            }
            serializer = UserSerializer(user, data=data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                user.set_password(data["password"])
                user.save()
                return Response({"msg": "Password reset successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"msg": "Validation error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
        except CustomUser.DoesNotExist:
            return Response({"msg": "Invalid token"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"msg": f"Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)