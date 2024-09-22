from rest_framework.permissions import SAFE_METHODS
from rest_framework.response import Response
from rest_framework import status
from functools import wraps

def is_admin_or_read_only(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.method in SAFE_METHODS:
            if not request.user or not request.user.is_authenticated:
                return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            if not request.user or not request.user.is_staff:
                return Response({'detail': 'Admin privileges required'}, status=status.HTTP_403_FORBIDDEN)
        return view_func(request, *args, **kwargs)
    return _wrapped_view
