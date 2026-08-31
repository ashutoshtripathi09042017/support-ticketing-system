import csv
from datetime import timedelta
from django.utils import timezone
from django.http import HttpResponse
from django.db import models
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Ticket, Reply, TicketHistory, SlaAlert, UserProfile
from .serializers import (
    TicketSerializer, ReplySerializer, TicketHistorySerializer, 
    SlaAlertSerializer, UserSerializer
)
from .permissions import IsSupervisor, IsAssigneeOrCollaboratorOrSupervisor

from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated, IsAssigneeOrCollaboratorOrSupervisor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Server-side Filtering & Search
    filterset_fields = ['status', 'priority', 'category', 'primary_assignee', 'is_archived']
    search_fields = ['subject', 'description']
    ordering_fields = ['created_at', 'priority', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all()
        
        # Agent rule: can only see assigned or collaborated tickets
        if hasattr(user, 'profile') and user.profile.role == 'AGENT':
            queryset = queryset.filter(
                models.Q(primary_assignee=user) | models.Q(collaborators=user)
            ).distinct()
            
        return queryset

    def perform_create(self, serializer):
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
        old_assignee = instance.primary_assignee
        
        new_status = request.data.get('status', old_status)
        new_assignee_id = request.data.get('primary_assignee', None)
        
        # Rule 1: Agent cannot reassign away from self
        if hasattr(request.user, 'profile') and request.user.profile.role == 'AGENT':
            if new_assignee_id and int(new_assignee_id) != request.user.id:
                return Response(
                    {"detail": "Agents cannot reassign tickets to other users."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Rule 4: Closed Ticket Reopen Window Check (e.g., 24 hours)
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
        """Bulk reassign or bulk close with per-item status report."""
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
        """Exports currently filtered queue as CSV."""
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tickets_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Subject', 'Status', 'Priority', 'Category', 'Assignee', 'Created At'])

        for t in queryset:
            assignee = t.primary_assignee.username if t.primary_assignee else 'Unassigned'
            writer.writerow([t.id, t.subject, t.status, t.priority, t.category, assignee, t.created_at])

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



#----------------------------- Login API Endpoint -----------------------------

class LoginView(APIView):
    permission_classes = []  # Public endpoint

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            login(request, user)
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
    