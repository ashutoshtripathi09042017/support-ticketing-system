from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet, 
    SlaAlertViewSet, 
    login_view, 
    CurrentUserView, 
    LogoutView, 
    get_csrf_token
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'sla-alerts', SlaAlertViewSet, basename='sla-alert')

urlpatterns = [
    # Auth & Helper Endpoints (Matching React Frontend Routes)
    path('csrf/', get_csrf_token, name='csrf'),
    path('login/', login_view, name='login'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # DRF Router Endpoints
    path('', include(router.urls)),
]