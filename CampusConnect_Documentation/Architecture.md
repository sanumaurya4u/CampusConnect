# Campus Connect — Architecture

## 1. Architecture Goal

Build a simple, maintainable, low-cost web application that can be developed using free-tier tools and later scaled without rewriting the entire product.

---

## 2. Recommended Free/Low-Cost Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React

### Backend

- Supabase
  - PostgreSQL database
  - Authentication
  - Storage
  - Row Level Security
  - Realtime where genuinely required

### Deployment

- Vercel free tier for frontend.
- Supabase free tier for backend.

### Development

- VS Code or any compatible IDE.
- Git.
- GitHub free repository.

### Optional Later

- Free-tier AI API where available.
- Email notification service with a free tier.
- PWA support before considering native apps.

Do not add a paid service unless it becomes necessary.

---

## 3. High-Level Architecture

```text
User
  |
  v
React Web App
  |
  +--> Authentication
  |
  +--> Role-Based UI
  |
  +--> Feature Modules
          |
          v
      Supabase Client
          |
    +-----+----------+---------+
    |                |         |
    v                v         v
 PostgreSQL       Storage    Realtime
    |
    +--> RLS Policies
    |
    +--> Database Functions
```

---

## 4. Main Application Flow

### Student Flow

```text
Landing Page
   ↓
Login / Register
   ↓
Complete Profile
   ↓
Select Interests
   ↓
Explore Clubs
   ↓
Club Details
   ↓
Join / Follow
   ↓
Discover Events
   ↓
Register
   ↓
Attend
   ↓
Activity History
```

### Organizer Flow

```text
Login
  ↓
Organizer Dashboard
  ↓
Select Managed Club
  ↓
Manage Members
  ↓
Create Announcement/Event/Project
  ↓
Manage Registrations
  ↓
Record Attendance
  ↓
View Engagement
```

### Faculty Flow

```text
Login
  ↓
Faculty Dashboard
  ↓
View Assigned Clubs
  ↓
Monitor Events/Activities
  ↓
View Club Reports
```

### Admin Flow

```text
Admin Login
   ↓
Admin Dashboard
   ↓
Manage Users
Manage Clubs
Manage Roles
Manage Events
View Analytics
   ↓
System Settings
```

---

## 5. Suggested Folder Structure

```text
campus-connect/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── clubs/
│   │   ├── events/
│   │   └── common/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── student/
│   │   ├── organizer/
│   │   ├── faculty/
│   │   └── admin/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── clubs/
│   │   ├── events/
│   │   ├── announcements/
│   │   ├── projects/
│   │   ├── collaborations/
│   │   └── activities/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── club.service.ts
│   │   ├── event.service.ts
│   │   └── notification.service.ts
│   │
│   ├── types/
│   ├── routes/
│   ├── constants/
│   ├── App.tsx
│   └── main.tsx
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── .env.example
├── README.md
├── PRD.md
├── Architecture.md
├── Rules.md
├── Phases.md
└── Design.md
```

---

## 6. Core Database Entities

```text
profiles
clubs
club_members
club_roles
club_applications
events
event_registrations
event_attendance
announcements
projects
project_members
project_applications
collaborations
notifications
student_activities
achievements
```

### Basic relationships

```text
Profile
  |
  +--> Club Membership --> Club
  |
  +--> Event Registration --> Event
  |
  +--> Activity Record
  |
  +--> Project Participation --> Project

Club
  |
  +--> Events
  +--> Announcements
  +--> Projects
  +--> Members
  +--> Collaborations
```

---

## 7. Security Architecture

Supabase Row Level Security must be enabled for user-facing tables.

Examples:

- Students can read public club information.
- Students can modify only their own profile.
- Organizers can manage only clubs they are assigned to.
- Faculty can access assigned clubs.
- Admin can manage institution-wide resources.

Never rely only on frontend role checks. Authorization must also be enforced at the database/API layer.

---

## 8. Architecture Principles

1. Prefer simple solutions.
2. Keep business logic modular.
3. Avoid unnecessary microservices.
4. Keep Supabase as the initial backend.
5. Do not introduce a custom backend until a real requirement exists.
6. Keep components reusable.
7. Keep environment secrets outside source code.
8. Use TypeScript types for database/API data.
9. Design the schema for future expansion without over-engineering it.
