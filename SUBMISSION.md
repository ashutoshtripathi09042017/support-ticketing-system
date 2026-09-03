# Submission

Fill this in and commit it. This is the first file we open.

## Links

- **GitHub repository:** https://github.com/your-username/support-ticketing-system
- **Live application:** http://localhost:5173 (Runs locally)

## Notes for the reviewer

The backend uses Django Session Authentication. Ensure both frontend (`http://localhost:5173`) and backend (`http://localhost:8000`) are running simultaneously on `localhost` to allow cross-origin session cookies to be saved properly.

## Demo credentials

| Role | Username / Email | Password |
|------|------------------|----------|
| **Supervisor** | `supervisor` | `Password123` |
| **Support Agent 1** | `agent1` | `Password123` |
| **Support Agent 2** | `agent2` | `Password123` |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React.js + Vite + Tailwind CSS | For fast component rendering, low-overhead state management, and modern responsive UI styling. |
| Backend | Django REST Framework (DRF) | Provides robust session authentication, ORM security, and fast API ViewSet generation out-of-the-box. |
| Database | SQLite | Zero-config embedded database suitable for rapid local development and testing. |
| Hosting | Localhost (`localhost:5173` / `8000`) | Configured locally for session cookie domain alignment and evaluation. |

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Role-based authentication (Agent / Supervisor) | Done | Session & cookie-based authentication with custom user profile roles. |
| 2 | Ticket queue list view | Done | Includes search bar and status/priority dynamic filters. |
| 3 | Ticket detail drawer view | Done | Fast side-panel preview allowing inline status updates without full reloads. |
| 4 | Internal notes vs Public replies | Done | Support agents can post internal notes (yellow callout) or public responses. |
| 5 | Ticket status updates & reassignment | Done | Statuses transition cleanly; supervisors can reassign primary agents. |
| 6 | CSV export functionality | Done | Supervisors can export filtered ticket queues into `.csv` format. |
| 7 | Django Admin interface integration | Done | ModelAdmins customized for Tickets, UserProfiles, and Replies. |
| 8 | CORS & Session security setup | Done | `withCredentials` & `CSRF_TRUSTED_ORIGINS` aligned on `localhost`. |
| 9 | Seed script for sample data | Done | Script populates test tickets, SLA deadlines, and user roles automatically. |
| 10 | Technical architecture documentation | Done | Complete guides available in `docs/` folder (`schema.md`, `architecture.md`, etc.). |

## How much time did you actually spend?

Approximately **12–14 hours** spent across architecture setup, backend API development, session security alignment, React drawer UI, and documentation.

## What would you do next, with another 12 hours?

* Implement WebSockets/Django Channels for real-time ticket queue updates without refreshing.
* Add file attachment capabilities (images/documents) to ticket responses.
* Integrate automated SLA countdown timers and email notifications for overdue tickets.

## What are you least happy with in this codebase, and why?

The state management on the React frontend currently relies heavily on local component state and context rather than Redux Toolkit or React Query. While sufficient for the current scale, adopting React Query would significantly simplify server-state caching, automatic re-fetching, and optimistic UI updates.