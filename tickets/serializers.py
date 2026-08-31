from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Ticket, Reply, TicketHistory, SlaAlert

# user serializer user model ko serialize karne ke liye
class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

# user profile serializer user profile model ko serialize karne ke liye
class ReplySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'ticket', 'author', 'author_name', 'message', 'is_internal', 'created_at']
        read_only_fields = ['author', 'created_at']


# TicketHistorySerializer maintain audit log of ticket changes, including status changes, reassignments, and replies. It captures the actor, action, old and new values, and timestamp for each change. This serializer is read-only to ensure the integrity of the history log.
class TicketHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = TicketHistory
        fields = ['id', 'ticket', 'actor', 'actor_name', 'action', 'old_value', 'new_value', 'timestamp']
        read_only_fields = ['id', 'ticket', 'actor', 'action', 'old_value', 'new_value', 'timestamp']

# TicketSerializer is used to serialize the Ticket model, including related fields such as primary assignee, collaborators, and replies. It provides a comprehensive view of the ticket's details, including its status, priority, category, and timestamps for creation and updates. The serializer also includes read-only fields for the names of the primary assignee and collaborators, as well as the list of replies associated with the ticket.
class TicketSerializer(serializers.ModelSerializer):
    primary_assignee_name = serializers.CharField(source='primary_assignee.username', read_only=True)
    collaborator_names = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='username', source='collaborators'
    )
    replies = ReplySerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'subject', 'description', 'requester_email', 'status', 
            'priority', 'category', 'primary_assignee', 'primary_assignee_name',
            'collaborators', 'collaborator_names', 'is_archived', 'created_at', 
            'updated_at', 'sla_due_at', 'sla_paused_at', 'total_paused_seconds', 
            'closed_at', 'replies'
        ]


# SlaAlertSerializer is used to serialize the SlaAlert model, which tracks SLA alerts for tickets. It includes fields for the ticket, the user who acknowledged the alert, whether the alert has been acknowledged, and the timestamp of when the alert was created. The serializer also provides a read-only field for the subject of the associated ticket, allowing for easy identification of the ticket related to the SLA alert.
class SlaAlertSerializer(serializers.ModelSerializer):
    ticket_subject = serializers.CharField(source='ticket.subject', read_only=True)

    class Meta:
        model = SlaAlert
        fields = ['id', 'ticket', 'ticket_subject', 'acknowledged_by', 'is_acknowledged', 'created_at']