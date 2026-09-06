from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Ticket, Reply, TicketHistory, SlaAlert

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


# Reply Serializer
class ReplySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'ticket', 'author', 'author_name', 'message', 'is_internal', 'created_at']
        read_only_fields = ['author', 'created_at']


# Ticket History Serializer (Immutable Audit Trail)
class TicketHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = TicketHistory
        fields = ['id', 'ticket', 'actor', 'actor_name', 'action', 'old_value', 'new_value', 'timestamp']
        read_only_fields = ['id', 'ticket', 'actor', 'action', 'old_value', 'new_value', 'timestamp']


# Main Ticket Serializer
class TicketSerializer(serializers.ModelSerializer):
    primary_assignee_name = serializers.CharField(source='primary_assignee.username', read_only=True)
    collaborator_names = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='username', source='collaborators'
    )
    replies = ReplySerializer(many=True, read_only=True)
    
    # Allows blank requester email in API request (auto-populates from user email if authenticated)
    requester_email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'subject', 'description', 'requester_email', 'status', 
            'priority', 'category', 'primary_assignee', 'primary_assignee_name',
            'collaborators', 'collaborator_names', 'is_archived', 'created_at', 
            'updated_at', 'sla_due_at', 'sla_paused_at', 'total_paused_seconds', 
            'closed_at', 'replies'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        
        # Fallback logic for requester_email if empty
        if not validated_data.get('requester_email'):
            if request and request.user and request.user.is_authenticated:
                validated_data['requester_email'] = request.user.email or f"{request.user.username}@support.com"
            else:
                validated_data['requester_email'] = "guest.customer@support.com"

        return super().create(validated_data)


# SLA Alert Serializer
class SlaAlertSerializer(serializers.ModelSerializer):
    ticket_subject = serializers.CharField(source='ticket.subject', read_only=True)

    class Meta:
        model = SlaAlert
        fields = ['id', 'ticket', 'ticket_subject', 'acknowledged_by', 'is_acknowledged', 'created_at']