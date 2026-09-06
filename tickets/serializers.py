from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ticket, Reply, TicketHistory, SlaAlert, UserProfile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True, default='AGENT')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


class ReplySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Reply
        fields = ['id', 'ticket', 'author', 'author_name', 'message', 'is_internal', 'created_at']


class TicketHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = TicketHistory
        fields = '__all__'


class TicketSerializer(serializers.ModelSerializer):
    replies = ReplySerializer(many=True, read_only=True)
    collaborators = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )
    primary_assignee_username = serializers.CharField(source='primary_assignee.username', read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'


class SlaAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlaAlert
        fields = '__all__'