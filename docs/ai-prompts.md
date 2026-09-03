AI Collaboration & Prompt History

This document records the AI-assisted engineering workflow, debugging history, and key prompts used throughout the development of the Support Ticketing System.



Overview of AI Assistance
AI tools were leveraged as a thought partner and pair-programmer for:
* Database & Schema Design: Structuring models for `UserProfile`, `Ticket`, and `Reply` with optimal Foreign Key constraints.
* Authentication & Security: Resolving cross-origin session/cookie issues (`403 Forbidden`) between React and DRF.
* Admin Registry & Error Handling: Fixing Django Admin model conflicts and import crashes.
* UI/UX Refinement: Adjusting frontend API response handlers for paginated and non-paginated ticket lists.



Prompts Log

Prompt 1: Authentication & CORS Session Alignment
"I am getting a 403 Forbidden error on GET /api/tickets/ after logging in successfully. How do I align Django session cookies with Axios in React?"
* Context: Session cookies were getting rejected due to cross-domain mismatches between `127.0.0.1:8000` and `localhost:5173`.
* Solution Provided:
  1. Updated `frontend/src/api.js` base URL to `http://localhost:8000/api/` and added `withCredentials: true`.
  2. Configured Django `settings.py` with `CORS_ALLOW_CREDENTIALS = True`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`.
  3. Added explicit `request.session.save()` inside `LoginView`.

---

Prompt 2: Django Admin Registration & Import Fixes
"How to resolve `AlreadyRegistered` and `ImportError` when registering custom ModelAdmin classes in admin.py?"
* Context: Reloading server threw `AlreadyRegistered` errors due to duplicate model declarations, followed by an `ImportError` for missing activity models.
* Solution Provided:
  1. Added an explicit `admin.site.unregister()` loop prior to using `@admin.register()` decorators.
  2. Cleaned up non-existent model imports (`ActivityLog`) from `tickets/admin.py`.

---

Prompt 3: Handling DRF API Pagination in React
"The backend returns 200 OK, but the ticket table on the React frontend is empty."
* Context: DRF returned data inside a paginated `results` array (`res.data.results`), whereas React state expected a direct array (`res.data`).
* Solution Provided:
  Implemented a fallback check in `QueueView.jsx`:
  ```javascript
  const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
  setTickets(data);