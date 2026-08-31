from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, SlaAlertViewSet, LoginView, CurrentUserView, LogoutView

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'sla-alerts', SlaAlertViewSet, basename='sla-alert')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('', include(router.urls)),
]