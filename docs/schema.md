Tables & Relationships

┌─────────────────────────────────────────────────────────────┐
│                    Django Default User                      │
│     (id, username, email, password, is_staff, is_active)     │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │ 1                            │ 1
                 │ (Extends User)               │ (Assigned as Agent)
                 ▼ 1                            ▼ N
  ┌──────────────────────────────┐    ┌──────────────────────────────┐
  │         UserProfile          │    │            Ticket            │
  │ ──────────────────────────── │    │ ──────────────────────────── │
  │ • id (PK)                    │    │ • id (PK - e.g., #101)       │
  │ • user_id (FK -> User)       │    │ • subject & description      │
  │ • role ('AGENT'/'SUPERVISOR')│    │ • requester_email (Customer) │
  └──────────────────────────────┘    │ • status (OPEN/PENDING/RESOLV│
                                      │ • priority (LOW..URGENT)     │
                                      │ • category (BUG/BILLING..)   │
                                      │ • primary_assignee_id (FK)   │
                                      │ • created_at & sla_due_at    │
                                      └──────────────┬───────────────┘
                                                     │ 1
                                                     │ (Has Many Replies)
                                                     ▼ N
                                      ┌──────────────────────────────┐
                                      │            Reply             │
                                      │ ──────────────────────────── │
                                      │ • id (PK)                    │
                                      │ • ticket_id (FK -> Ticket)   │
                                      │ • author_id (FK -> User)     │
                                      │ • body (Message/Note)        │
                                      │ • is_internal (True/False)   │
                                      │ • created_at                 │
                                      └──────────────────────────────┘


Step-by-Step Data Flow Explanation:

01. User Creation & Roles (User ↔ UserProfile):

-> Jab bhi koi Agent ya Supervisor system me add hota hai, Django ke base User table me account banta hai.

-> UserProfile table User ke saath One-to-One (1:1) relationship share karti hai aur us user ka Specific Role (AGENT ya SUPERVISOR) identify karti hai.

02. Ticket Creation (Ticket):

-> Support Request aane par Ticket table me record banta hai.

-> Customer ki details requester_email me rehti hai.

-> Admin ya Supervisor kisi Agent ko ticket assign karta hai, toh Ticket.primary_assignee me User ki Foreign Key (FK) link hoti hai (One-to-Many / 1:N relation).

03. Replies & Internal Notes (Ticket ↔ Reply):

-> Ek single ticket par multiple conversation threads ho sakte hain (One-to-Many / 1:N relation).

-> Har Reply ek Ticket (ticket_id) aur usko likhne wale Agent/Supervisor (author_id) se linked hoti hai.

-> is_internal = True mark hone par wo note sirf support team (Agents/Supervisors) ko dikhta hai, customer ko nahi.