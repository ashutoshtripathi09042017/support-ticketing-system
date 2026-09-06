from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ticket, Reply, TicketHistory, SlaAlert, UserProfile


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

    def get_role(self, obj):
        if hasattr(obj, 'profile') and obj.profile.role:
            return obj.profile.role
        return 'SUPERVISOR' if (obj.is_staff or obj.is_superuser) else 'AGENT'


class ReplySerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Reply
        fields = ['id', 'ticket', 'author', 'author_name', 'message', 'is_internal', 'created_at']

    def get_author_name(self, obj):
        return obj.author.username if obj.author else "System"


class TicketHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketHistory
        fields = '__all__'

    def get_actor_name(self, obj):
        return obj.actor.username if obj.actor else "System"


class TicketSerializer(serializers.ModelSerializer):
    replies = ReplySerializer(many=True, read_only=True)
    collaborators = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )
    primary_assignee_username = serializers.SerializerMethodField()
    collaborators_usernames = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = '__all__'

    # Safe null-proof Username Extractor
    def get_primary_assignee_username(self, obj):
        if obj.primary_assignee:
            return obj.primary_assignee.username
        return "Unassigned"

    def get_collaborators_usernames(self, obj):
        return [user.username for user in obj.collaborators.all()]


class SlaAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlaAlert
        fields = '__all__'