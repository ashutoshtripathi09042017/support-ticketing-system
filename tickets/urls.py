from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, SlaAlertViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'sla-alerts', SlaAlertViewSet, basename='sla-alert')

urlpatterns = [
    path('', include(router.urls)),
]