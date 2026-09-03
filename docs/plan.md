Project Name : support-ticketing-system

Objective : To build a full-stack Support Ticketing System using Django REST Framework (Backend) and React + Vite (Frontend) to streamline ticket queue management, agent assignments, and customer resolutions.

Project planed in 4 phases:
1. Environment & Authentication Setup
-> Setup Django backend and React frontend repositories.
-> Configure custom UserProfile model for role-based access ('AGENT', 'SUPERVISOR').
-> Implement Session/Cookie authentication with CSRF protection and domain alignment ('localhost').

2. Core API & Data Modeling
-> Design Database Schema for 'Ticket', 'Reply', and 'ActivityLog'.
-> Build ViewSets with filtering, searching, and custom permissions ('IsAgentOrSupervisor').
-> Create seed scripts ('seed_data.py,) to auto-populate test tickets and users.

3. Frontend Dashboard & Workflows
-> Build responsive Ticket Queue with search, priority, and status filters.
-> Add Ticket Drawer/Modal for quick status updates and reply submissions.
-> Integrate CSV Export functionality for supervisors.

4. Django Admin & Quality Assurance
-> Register custom ModelAdmins for Django Admin dashboard.
-> Resolve CORS, cross-domain cookies, and 403 Forbidden errors.
-> End-to-end functionality verification across Agent and Supervisor roles.
