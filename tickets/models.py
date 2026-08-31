from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model): # model for user roles
    ROLE_CHOICES = (
        ('SUPERVISOR', 'Supervisor'),
        ('AGENT', 'Agent'),
    ) # Tuple for role choices
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='AGENT') # choicing agent as default role

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Ticket(models.Model):
    STATUS_CHOICES = (
        ('NEW', 'New'),
        ('OPEN', 'Open'),
        ('PENDING', 'Pending'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    )

    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )

    CATEGORY_CHOICES = (
        ('BUG', 'Bug Report'),
        ('BILLING', 'Billing'),
        ('QUESTION', 'General Question'),
        ('FEATURE', 'Feature Request'),
    )

    subject = models.CharField(max_length=255)
    description = models.TextField()
    requester_email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='QUESTION')

    # Assignees & Collaborators
    primary_assignee = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets'
    )
    collaborators = models.ManyToManyField(User, blank=True, related_name='collaborating_tickets')

    # Soft Delete / Archive
    is_archived = models.BooleanField(default=False)

    # SLA Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sla_due_at = models.DateTimeField(null=True, blank=True)
    
    # SLA Pause tracking for Pending state
    sla_paused_at = models.DateTimeField(null=True, blank=True)
    total_paused_seconds = models.PositiveIntegerField(default=0)

    # Reopen Window tracking
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"#{self.id} - {self.subject}"


class Reply(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.author.username} on Ticket #{self.ticket.id}"


class TicketHistory(models.Model):
    """Immutable Timeline Log — edits aur deletes block honge application level par."""
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='history')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)  # e.g., 'STATUS_CHANGE', 'REASSIGNMENT', 'REPLY_ADDED'
    old_value = models.CharField(max_length=255, null=True, blank=True)
    new_value = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"History for Ticket #{self.ticket.id} at {self.timestamp}"


class SlaAlert(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='sla_alerts')
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SLA Alert for Ticket #{self.ticket.id}"