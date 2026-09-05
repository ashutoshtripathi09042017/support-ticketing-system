import csv
import json
from datetime import timedelta
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.http import HttpResponse, JsonResponse
from django.db import models
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Ticket, Reply, TicketHistory, SlaAlert, UserProfile
from .serializers import (
    TicketSerializer, ReplySerializer, TicketHistorySerializer, 
    SlaAlertSerializer, UserSerializer
)


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Server-side Filtering & Search
    filterset_fields = ['status', 'priority', 'category', 'primary_assignee', 'is_archived']
    search_fields = ['subject', 'description']
    ordering_fields = ['created_at', 'priority', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all()
        
        # Superuser ya Supervisor ke liye sab access
        if user.is_superuser or user.is_staff:
            return queryset
            
        # Agent rule: can only see assigned or collaborated tickets
        if hasattr(user, 'profile') and user.profile.role == 'AGENT':
            queryset = queryset.filter(
                models.Q(primary_assignee=user) | models.Q(collaborators=user)
            ).distinct()
            
        return queryset

    def perform_create(self, serializer):
        # Auto-assign creator if not provided
        ticket = serializer.save()
        TicketHistory.objects.create(
            ticket=ticket,
            actor=self.request.user,
            action='TICKET_CREATED',
            new_value=ticket.status
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        new_status = request.data.get('status', old_status)
        new_assignee_id = request.data.get('primary_assignee', None)
        
        # Rule 1: Agent cannot reassign away from self
        if hasattr(request.user, 'profile') and request.user.profile.role == 'AGENT':
            if new_assignee_id and int(new_assignee_id) != request.user.id:
                return Response(
                    {"detail": "Agents cannot reassign tickets to other users."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Rule 2: Closed Ticket Reopen Window Check (24 hours)
        if old_status == 'CLOSED' and new_status != 'CLOSED':
            if instance.closed_at and (timezone.now() - instance.closed_at) > timedelta(hours=24):
                return Response(
                    {"detail": "Cannot reopen a ticket after the 24-hour closure window has passed."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # SLA Pause Logic
        if new_status == 'PENDING' and old_status != 'PENDING':
            instance.sla_paused_at = timezone.now()
        elif old_status == 'PENDING' and new_status != 'PENDING':
            if instance.sla_paused_at:
                paused_duration = (timezone.now() - instance.sla_paused_at).seconds
                instance.total_paused_seconds += paused_duration
                instance.sla_paused_at = None

        if new_status == 'CLOSED' and old_status != 'CLOSED':
            instance.closed_at = timezone.now()

        response = super().update(request, *args, **kwargs)
        
        # Audit Logging
        if old_status != new_status:
            TicketHistory.objects.create(
                ticket=instance, actor=request.user,
                action='STATUS_CHANGE', old_value=old_status, new_value=new_status
            )
            
        return response

    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        ticket = self.get_object()
        message = request.data.get('message')
        is_internal = request.data.get('is_internal', False)

        if not message:
            return Response({"detail": "Message body is required."}, status=status.HTTP_400_BAD_REQUEST)

        reply = Reply.objects.create(
            ticket=ticket, author=request.user, message=message, is_internal=is_internal
        )

        # Auto transition from Pending -> Open on customer/agent response
        if ticket.status == 'PENDING':
            ticket.status = 'OPEN'
            if ticket.sla_paused_at:
                ticket.total_paused_seconds += (timezone.now() - ticket.sla_paused_at).seconds
                ticket.sla_paused_at = None
            ticket.save()

        # Record in Immutable History
        TicketHistory.objects.create(
            ticket=ticket, actor=request.user,
            action='REPLY_ADDED', new_value='Internal Note' if is_internal else 'Customer Reply'
        )

        return Response(ReplySerializer(reply).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        ticket_ids = request.data.get('ticket_ids', [])
        action_type = request.data.get('action') # 'reassign' or 'close'
        target_assignee_id = request.data.get('assignee_id')

        succeeded = []
        failed = []

        for tid in ticket_ids:
            try:
                ticket = Ticket.objects.get(id=tid)
                
                # Check permissions
                if hasattr(request.user, 'profile') and request.user.profile.role == 'AGENT':
                    if ticket.primary_assignee != request.user and request.user not in ticket.collaborators.all():
                        failed.append({"id": tid, "reason": "Permission denied for this ticket."})
                        continue

                if action_type == 'close':
                    if ticket.status == 'CLOSED':
                        failed.append({"id": tid, "reason": "Ticket is already closed."})
                        continue
                    old = ticket.status
                    ticket.status = 'CLOSED'
                    ticket.closed_at = timezone.now()
                    ticket.save()
                    TicketHistory.objects.create(
                        ticket=ticket, actor=request.user, action='STATUS_CHANGE', old_value=old, new_value='CLOSED'
                    )
                    succeeded.append(tid)

                elif action_type == 'reassign':
                    if hasattr(request.user, 'profile') and request.user.profile.role == 'AGENT':
                        failed.append({"id": tid, "reason": "Agents cannot reassign tickets."})
                        continue
                    ticket.primary_assignee_id = target_assignee_id
                    ticket.save()
                    TicketHistory.objects.create(
                        ticket=ticket, actor=request.user, action='REASSIGNMENT', new_value=str(target_assignee_id)
                    )
                    succeeded.append(tid)

            except Ticket.DoesNotExist:
                failed.append({"id": tid, "reason": "Ticket not found."})

        return Response({"succeeded": succeeded, "failed": failed}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tickets.csv"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Subject', 'Status', 'Priority', 'Category', 'Assignee', 'Created At'])

        queryset = self.filter_queryset(self.get_queryset())
        for ticket in queryset:
            assignee = ticket.primary_assignee.username if ticket.primary_assignee else 'Unassigned'
            writer.writerow([
                ticket.id,
                ticket.subject,
                ticket.status,
                ticket.priority,
                ticket.category,
                assignee,
                ticket.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])

        return response


class SlaAlertViewSet(viewsets.ModelViewSet):
    queryset = SlaAlert.objects.all()
    serializer_class = SlaAlertSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        alert = self.get_object()
        alert.is_acknowledged = True
        alert.acknowledged_by = request.user
        alert.save()
        return Response({"status": "acknowledged"}, status=status.HTTP_200_OK)


# ----------------------------- Authentication Endpoints -----------------------------

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return Response({'detail': 'CSRF cookie set'})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                role = user.profile.role if hasattr(user, 'profile') else 'SUPERVISOR'
                return JsonResponse({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': role
                })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'POST request required'}, status=405)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.profile.role if hasattr(user, 'profile') else 'SUPERVISOR'
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role
        })


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)