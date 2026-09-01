from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tickets.models import UserProfile, Ticket, Reply, TicketHistory
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds database with initial users and tickets'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # Create Supervisor (with Admin access)
        sup, created = User.objects.get_or_create(username='supervisor', email='supervisor@example.com')
        sup.set_password('Password123')
        sup.is_staff = True
        sup.is_superuser = True
        sup.save()

        if not hasattr(sup, 'profile'):
          UserProfile.objects.create(user=sup, role='SUPERVISOR')

        # Create Agents
        agent1, created = User.objects.get_or_create(username='agent1', email='agent1@example.com')
        if created:
            agent1.set_password('Password123')
            agent1.save()
            UserProfile.objects.create(user=agent1, role='AGENT')

        agent2, created = User.objects.get_or_create(username='agent2', email='agent2@example.com')
        if created:
            agent2.set_password('Password123')
            agent2.save()
            UserProfile.objects.create(user=agent2, role='AGENT')

        # Create Sample Tickets
        t1 = Ticket.objects.create(
            subject='Cannot access billing invoice',
            description='Payment went through but invoice PDF gives 404 error.',
            requester_email='customer1@example.com',
            status='OPEN',
            priority='HIGH',
            category='BILLING',
            primary_assignee=agent1,
            sla_due_at=timezone.now() + timedelta(hours=4)
        )
        t1.collaborators.add(agent2)

        t2 = Ticket.objects.create(
            subject='Login button not responding on Mobile Safari',
            description='Tapping login does nothing after iOS update.',
            requester_email='customer2@example.com',
            status='PENDING',
            priority='URGENT',
            category='BUG',
            primary_assignee=agent2,
            sla_due_at=timezone.now() - timedelta(hours=2) # SLA Breached
        )

        Reply.objects.create(
            ticket=t1, author=sup, message='Checking with finance team.', is_internal=True
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo users & tickets!'))