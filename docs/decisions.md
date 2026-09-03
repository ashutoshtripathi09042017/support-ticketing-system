Key Architectural & Technical Decisions (ADR):

1. Session Authentication over JWT
-> Used Django's built-in Session Authentication instead of JSON Web Tokens (JWT).
-> Session cookies with HTTP-only and SameSite policies provide stronger security against XSS attacks for web dashboards and integrate seamlessly with Django Admin.

2. Shared Host Domain ('localhost')
-> Standardized backend ('localhost:8000') and frontend ('localhost:5173') URLs to share the exact 'localhost' domain.
-> Prevents browser cross-site cookie restrictions and CORS pre-flight blocking issues caused by mixing '127.0.0.1' and 'localhost'.


3. Single-Page Drawer View for Tickets
-> Implemented a slide-over Drawer Panel on the main Ticket Queue instead of navigating to separate URL pages.
-> Improves user experience for support agents by reducing load times and allowing fast context switching between tickets.
