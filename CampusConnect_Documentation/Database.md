# Campus Connect — Database & RLS

## 1. Database Goal

Campus Connect will use **Supabase PostgreSQL** as its primary database.

The database must support:

- Students
- Clubs
- Club organizers
- Faculty in-charges
- College administrators
- Events
- Registrations
- Attendance
- Announcements
- Projects
- Club collaborations
- Notifications
- Student activity history
- Achievements

The database should remain simple enough for the free Supabase tier and structured enough to scale later.

---

## 2. Database Principles

1. Use PostgreSQL through Supabase.
2. Use UUIDs for primary keys.
3. Use foreign keys for relationships.
4. Add `created_at` and `updated_at` to important tables.
5. Use database constraints wherever possible.
6. Enable Row Level Security (RLS) on all application tables containing user or institution data.
7. Never depend only on frontend authorization.
8. Keep sensitive data out of public tables.
9. Use migrations for schema changes.
10. Do not store passwords manually; use Supabase Auth.

---

# 3. Core Tables

## 3.1 `profiles`

Stores application-level information for authenticated users.

| Column | Type | Description |
|---|---|---|
| id | uuid | References `auth.users.id` |
| full_name | text | User's name |
| email | text | User email |
| role | enum/text | student, organizer, faculty, admin |
| department | text | Academic department |
| semester | text | Current semester |
| avatar_url | text | Profile image |
| bio | text | Optional profile description |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### Rule

A user can update only their own profile unless they are an authorized admin.

---

## 3.2 `clubs`

Stores official campus clubs.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text | Club name |
| slug | text | Unique URL-friendly name |
| description | text | Club description |
| objective | text | Club objective |
| category | text | Club category |
| logo_url | text | Club logo |
| status | text | pending, active, archived |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

The initial UIET data can represent clubs such as AI Club, Pixel Pioneers, The Debuggers, TechTalk, Mathematics Club, Wellness Vibe Club, Genzyme Hub Club, and Oratory Club. The supplied prototype also identifies teacher in-charges, coordinators, objectives, and activities for these clubs. fileciteturn2file0

---

## 3.3 `club_members`

Connects users with clubs.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| club_id | uuid | References clubs |
| user_id | uuid | References profiles |
| membership_role | text | member, coordinator, faculty |
| status | text | pending, active, rejected |
| joined_at | timestamptz | Membership date |

### Constraint

A user should not have duplicate active membership in the same club.

---

## 3.4 `club_applications`

Stores requests to join clubs.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| club_id | uuid | Target club |
| applicant_id | uuid | Student |
| message | text | Optional application message |
| status | text | pending, approved, rejected |
| reviewed_by | uuid | Organizer/admin |
| created_at | timestamptz | Application time |
| reviewed_at | timestamptz | Review time |

---

## 3.5 `events`

Stores club and campus events.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| club_id | uuid | Organizing club |
| title | text | Event title |
| description | text | Event description |
| location | text | Physical/online location |
| start_at | timestamptz | Start time |
| end_at | timestamptz | End time |
| capacity | integer | Maximum participants |
| status | text | draft, published, completed, cancelled |
| created_by | uuid | Organizer |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

---

## 3.6 `event_registrations`

Connects students with events.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| event_id | uuid | Event |
| user_id | uuid | Student |
| status | text | registered, cancelled, attended |
| registered_at | timestamptz | Registration time |

### Constraint

A student can have only one active registration for an event.

---

## 3.7 `event_attendance`

Stores actual participation.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| event_id | uuid | Event |
| user_id | uuid | Student |
| marked_by | uuid | Organizer |
| attended_at | timestamptz | Attendance time |

Attendance should be separate from registration because registration does not prove participation.

---

## 3.8 `announcements`

Stores club/campus announcements.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| club_id | uuid | Optional club |
| title | text | Announcement title |
| content | text | Announcement body |
| created_by | uuid | Author |
| published_at | timestamptz | Publication time |
| status | text | draft, published, archived |

If `club_id` is null, the announcement can represent an institution-wide announcement subject to admin permissions.

---

## 3.9 `projects`

Stores student/club projects.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| club_id | uuid | Owning club |
| title | text | Project title |
| description | text | Description |
| required_skills | jsonb | Required skills |
| status | text | open, active, completed, archived |
| created_by | uuid | Creator |
| created_at | timestamptz | Creation time |

---

## 3.10 `project_members`

Connects students with projects.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| project_id | uuid | Project |
| user_id | uuid | Student |
| project_role | text | member, lead |
| joined_at | timestamptz | Joining time |

---

## 3.11 `project_applications`

Stores student applications to projects.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| project_id | uuid | Project |
| applicant_id | uuid | Student |
| message | text | Application |
| status | text | pending, accepted, rejected |
| created_at | timestamptz | Application time |

---

## 3.12 `collaborations`

Stores club-to-club collaboration requests.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| requesting_club_id | uuid | Requesting club |
| target_club_id | uuid | Target club |
| title | text | Collaboration title |
| description | text | Proposal |
| status | text | pending, accepted, rejected, completed |
| created_by | uuid | Organizer |
| created_at | timestamptz | Creation time |

This supports use cases such as multiple clubs organizing a joint hackathon, workshop, debate, or project.

---

## 3.13 `notifications`

Stores user notifications.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Recipient |
| title | text | Notification title |
| message | text | Notification message |
| type | text | event, club, announcement, collaboration, system |
| reference_id | uuid | Optional related record |
| read_at | timestamptz | Null when unread |
| created_at | timestamptz | Creation time |

---

## 3.14 `student_activities`

Central activity history for the Activity Passport.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Student |
| activity_type | text | event, project, club, leadership, volunteer |
| reference_id | uuid | Related record |
| title | text | Activity title |
| metadata | jsonb | Additional information |
| occurred_at | timestamptz | Activity time |
| created_at | timestamptz | Record creation |

This should contain derived participation records rather than sensitive academic information.

---

## 3.15 `achievements`

Stores student achievements/badges.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Student |
| title | text | Achievement |
| description | text | Achievement description |
| achievement_type | text | participation, leadership, project, event |
| awarded_at | timestamptz | Award date |

Achievements should be based on actual activity data and not be manually fabricated by the client.

---

# 4. Relationship Overview

```text
auth.users
     |
     v
profiles
     |
     +--------------------+
     |                    |
     v                    v
club_members          student_activities
     |
     v
clubs
  |
  +---- events ---- event_registrations ---- profiles
  |                    |
  |                    +---- event_attendance
  |
  +---- announcements
  |
  +---- projects ---- project_members ---- profiles
  |
  +---- collaborations ---- clubs
  |
  +---- club_applications ---- profiles
```

---

# 5. Role Model

## Student

Can:

- Read public clubs.
- Read published events.
- Join/follow clubs.
- Register for events.
- Apply for projects.
- View own activities.
- View own notifications.
- Update own profile.

Cannot:

- Modify official club information.
- Manage another student's data.
- Create official club events unless granted organizer permissions.

---

## Organizer

Can:

- Manage assigned club.
- Manage club members.
- Create/update club events.
- Publish club announcements.
- Manage event registrations.
- Mark attendance.
- Create club projects.
- Initiate collaborations.

Cannot:

- Manage unrelated clubs.
- Change institution-wide settings.
- Grant themselves admin permissions.

---

## Faculty

Can:

- View assigned clubs.
- Monitor club activities.
- View club-level participation.
- Review relevant reports.

Cannot:

- Modify unrelated clubs unless explicitly granted permission.

---

## Admin

Can:

- Manage institution-wide users.
- Manage clubs.
- Assign roles.
- Approve clubs.
- Manage categories.
- View institution-wide analytics.
- Manage platform configuration.

---

# 6. Row Level Security (RLS)

RLS is a critical security layer.

Enable RLS on every application table that contains protected data.

## Basic principle

```text
Student
   ↓
Only own private data

Organizer
   ↓
Only assigned club data

Faculty
   ↓
Only assigned club/supervised data

Admin
   ↓
Institution-wide access
```

---

# 7. RLS Helper Functions

Avoid repeating complicated role checks in every policy.

Create small PostgreSQL helper functions such as:

```text
is_admin()
is_faculty()
is_organizer()
is_club_organizer(club_id)
is_club_faculty(club_id)
```

These functions should be carefully designed to avoid recursive RLS evaluation.

---

# 8. Example RLS Policies

## Profiles

### SELECT

Users can view appropriate public profile fields, while private profile information should be restricted.

### UPDATE

```text
auth.uid() = id
```

A user can update only their own profile.

Admin can update profiles according to administrative requirements.

---

## Clubs

### SELECT

Authenticated users can read active/public club information.

### INSERT

Only authorized admin users can create official clubs.

### UPDATE

- Assigned organizers can update permitted club fields.
- Faculty/admin can supervise or approve according to role.
- Students cannot modify official club information.

---

## Club Members

### SELECT

- A student can see their own membership.
- Authorized club organizers can see members of their club.
- Faculty can see members of supervised clubs.
- Admin can see institution-wide membership.

### INSERT/DELETE

Membership changes must happen through authorized workflows.

---

## Events

### SELECT

Published events are readable by authenticated users.

### INSERT/UPDATE/DELETE

Only organizers assigned to the event's club, faculty with appropriate supervision, or admin can perform these operations.

---

## Event Registrations

### SELECT

A student can view their own registrations.

Organizers can view registrations for events belonging to their club.

### INSERT

A student can create a registration for themselves.

### UPDATE/CANCEL

A student can update/cancel their own registration subject to event status.

Organizers can manage registrations for their own events.

---

## Attendance

Students should not be able to mark their own attendance.

Only authorized organizers/faculty/admin can create attendance records.

---

## Announcements

Students can read published announcements.

Only authorized club organizers can create announcements for their clubs.

Only admin can create institution-wide announcements.

---

## Projects

Students can view open projects.

Project creators/authorized organizers can manage their own projects.

Students can create applications for themselves.

---

## Notifications

A user can read and update only their own notifications.

System-generated notifications should not be writable directly by ordinary clients.

---

## Student Activities

Students can read their own activity history.

Activity records should be generated by trusted workflows after verified participation.

Students must not be able to directly create arbitrary achievements or participation records.

---

# 9. Database Security Rules

Never:

- Put the Supabase service-role key in the frontend.
- Disable RLS to make development easier.
- Trust a frontend role value for authorization.
- Allow users to update another user's records without authorization.
- Allow students to modify attendance.
- Allow organizers to modify unrelated clubs.
- Store passwords in PostgreSQL tables.
- Store sensitive credentials in database rows unnecessarily.

---

# 10. Data Integrity

Use constraints for important rules.

Examples:

```text
unique(club_id, user_id)
unique(event_id, user_id)
unique(project_id, user_id)
unique(slug)
```

Use foreign keys for relationships.

Use `NOT NULL` for fields that are mandatory.

Use controlled status values rather than arbitrary strings where practical.

---

# 11. Timestamps

Important tables should normally include:

```text
created_at
updated_at
```

Use database defaults for `created_at`.

For `updated_at`, use a PostgreSQL trigger or a controlled update mechanism.

---

# 12. Indexing Strategy

Do not over-index the free-tier database.

Initially consider indexes on:

```text
profiles.role
clubs.status
clubs.category
club_members.club_id
club_members.user_id
events.club_id
events.start_at
event_registrations.event_id
event_registrations.user_id
notifications.user_id
notifications.read_at
student_activities.user_id
```

Add more indexes only after observing real query patterns.

---

# 13. Storage

Use Supabase Storage for:

- Profile images.
- Club logos.
- Event images.
- Project images.

Suggested buckets:

```text
avatars
club-assets
event-assets
project-assets
```

Storage policies must also enforce appropriate access rules.

---

# 14. Seed Data

For the initial UIET prototype/demo, seed only non-sensitive institutional information such as:

- Club names.
- Objectives.
- Activities.
- Club categories.
- Public organizational roles where permitted.

Do not publish personal phone numbers or other private contact details from source documents unless the institution has explicitly authorized their publication.

The supplied prototype contains coordinator contact numbers; those should **not automatically be copied into the public CampusConnect database**. fileciteturn2file0

---

# 15. Database Development Workflow

Use Supabase migrations.

Recommended sequence:

```text
001_profiles.sql
002_clubs.sql
003_club_members.sql
004_club_applications.sql
005_events.sql
006_event_registrations.sql
007_event_attendance.sql
008_announcements.sql
009_projects.sql
010_collaborations.sql
011_notifications.sql
012_student_activities.sql
013_achievements.sql
014_rls_policies.sql
015_seed_data.sql
```

The exact migration count can change as the schema evolves.

---

# 16. MVP Database Scope

Do not create every table before the MVP.

### Phase 1

```text
profiles
clubs
club_members
club_applications
```

### Phase 2

```text
events
event_registrations
event_attendance
announcements
```

### Phase 3

```text
notifications
student_activities
```

### Phase 4

```text
projects
project_members
project_applications
collaborations
achievements
```

Build tables when the corresponding feature is actually implemented.

---

# 17. Future Expansion

The schema should eventually support:

- Multiple institutions.
- Institution-specific roles.
- Multi-campus organizations.
- Advanced recommendations.
- QR event check-in.
- PWA/mobile clients.
- Analytics.
- External integrations.

If multi-college deployment becomes a real requirement, introduce an `institutions` table and associate users, clubs, events, and other institution-owned resources with it.

Do not add multi-tenancy complexity to the MVP unless required.

---

## Final Database Principle

> **Keep the schema simple, enforce permissions at the database level, record only verified activity, and introduce complexity only when the product actually needs it.**
