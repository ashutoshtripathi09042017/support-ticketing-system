Architecture Overview

Moving Pieces:
- Backend: Django REST Framework
- Frontend: React (Vite)
- Database: SQLite

Request Flow:
```text
┌───────────────────────────┐           HTTP / REST API           ┌───────────────────────────┐
│     React Frontend        │ ──────────────────────────────────> │   Django REST Framework   │
│  (Vite - localhost:5173)  │ <────────────────────────────────── │   (Backend - Port 8000)   │
└───────────────────────────┘    Session Cookie / JSON Data       └─────────────┬─────────────┘
                                                                                │
                                                                                ▼
                                                                  ┌───────────────────────────┐
                                                                  │  SQLite / PostgreSQL DB   │
                                                                  └───────────────────────────┘


Frontend Layer (frontend/) :
-> React + Vite: Ultra-fast UI rendering and component architecture.
-> Axios API Interceptor: Automatic CSRF token handling and credentials sharing (withCredentials: true).
-> State Management: React Context API (AuthContext) for current user authentication and role state.

Backend Layer (tickets/):
-> Django REST Framework: Serializers and ViewSets handling request verification and JSON output.
-> Session Authentication: Secure cookie-based authentication aligned with browser domain policies.
-> Role-Based Permissions: Granular views allowing supervisors full system access while agents view assigned/open tickets.