from django.contrib import admin
from .models import UserProfile, Ticket, Reply

# Unregister models if already registered to avoid AlreadyRegistered errors
for model in [UserProfile, Ticket, Reply]:
    if admin.site.is_registered(model):
        admin.site.unregister(model)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'status', 'priority', 'category', 'primary_assignee', 'created_at')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('subject', 'description', 'requester_email')

@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'author', 'is_internal', 'created_at')