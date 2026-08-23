# Campus Connect — Product Requirements Document

## 1. Product Overview

**Campus Connect** is a centralized campus engagement platform that connects students with college clubs, club organizers, faculty in-charges, events, projects, and opportunities.

The platform aims to replace fragmented club communication and activity management with one structured ecosystem where students can **discover, join, participate, and collaborate**.

### Core Value Proposition

> **Discover. Participate. Collaborate.**

Campus Connect is initially designed for a college-level deployment and should be capable of expanding to other institutions later.

---

## 2. Problem

Students often discover clubs and activities through scattered WhatsApp groups, social media posts, notices, word of mouth, and separate forms.

This creates:

- Poor visibility of available clubs and activities.
- Difficulty finding clubs relevant to a student's interests.
- Missed events and opportunities.
- Unstructured club communication.
- Manual member and event management.
- Limited collaboration between different clubs.
- No centralized record of student participation.

Club organizers also need a structured way to manage members, events, announcements, registrations, attendance, and projects.

---

## 3. Target Users

### 3.1 Students — Primary Users

Students can:

- Create a profile.
- Select interests and goals.
- Discover clubs.
- View detailed club information.
- Join or follow clubs.
- Discover and register for events.
- Participate in projects and opportunities.
- Interact with organizers.
- Track participation and achievements.

### 3.2 Club Organizers — Primary Operational Users

Club coordinators can:

- Manage their club profile.
- Manage members.
- Publish announcements.
- Create and manage events.
- Manage registrations.
- Record attendance.
- Create projects and opportunities.
- Request collaboration with other clubs.
- View basic club engagement analytics.

### 3.3 Faculty In-Charge — Supervisory Users

Faculty members can:

- View assigned club information.
- Monitor activities and events.
- Review club participation.
- Supervise organizers.
- View club-level reports.

### 3.4 College Administration — Institutional Users

Administrators can:

- Manage students and clubs.
- Approve clubs and organizers.
- Assign faculty in-charges.
- Manage platform-wide events and categories.
- Monitor campus engagement.
- View reports and analytics.
- Manage roles and permissions.

---

## 4. Initial Campus Context

The supplied UIET MDU club prototype identifies clubs such as AI Club, Pixel Pioneers, The Debuggers, TechTalk, Mathematics Club, Wellness Vibe Club, Genzyme Hub Club, and Oratory Club. It also defines teacher in-charges, student/research-scholar coordinators, objectives, and activities for these clubs. Campus Connect should model this existing structure rather than inventing a completely different organizational system.

Examples include AI/data-science activities, design and digital-content activities, DSA/coding/hackathons, career preparation, mathematics activities, wellness activities, innovation/projects, and public speaking/debates.

---

## 5. Product Goals

1. Make every college club discoverable in one place.
2. Help students find activities relevant to their interests.
3. Give organizers a structured club-management workspace.
4. Make event discovery and registration simple.
5. Enable structured student and club interaction.
6. Enable collaboration between clubs.
7. Maintain a useful record of student participation.
8. Provide administrators with campus engagement visibility.

---

## 6. Core Features

### 6.1 Authentication & Roles

- Student registration/login.
- Organizer login.
- Faculty login.
- Admin login.
- Role-based access control.
- Profile management.

### 6.2 Student Profile

- Name, department, semester and basic academic information.
- Interests.
- Skills.
- Goals.
- Joined clubs.
- Followed clubs.
- Registered events.
- Participation history.

### 6.3 Club Directory

- Search and filter clubs.
- Club categories.
- Club profile.
- Objective.
- Activities.
- Teacher in-charge.
- Organizers/coordinators.
- Member count.
- Upcoming events.
- Join/follow action.

### 6.4 Club Workspace

- Club dashboard.
- Member management.
- Announcements.
- Events.
- Registrations.
- Attendance.
- Projects.
- Opportunities.
- Basic analytics.

### 6.5 Events

- Create event.
- Event details.
- Registration.
- Capacity.
- Event status.
- Attendance.
- Event history.

### 6.6 Announcements

- Club announcements.
- Campus announcements.
- Targeted notifications.
- Announcement history.

### 6.7 Club Collaboration

- Collaboration request.
- Club-to-club communication.
- Joint event creation.
- Shared projects.

### 6.8 Projects & Opportunities

- Create project/opportunity.
- Define required skills.
- Student applications.
- Manage project members.
- Project status.

### 6.9 Activity Passport

Maintain a student participation record containing:

- Clubs joined.
- Events attended.
- Projects participated in.
- Leadership roles.
- Volunteer/activity records.
- Achievements/badges.

This is a participation record, not a replacement for an official academic transcript.

### 6.10 Notifications

- Event reminders.
- Registration confirmations.
- Join-request updates.
- Announcements.
- Collaboration requests.

### 6.11 Admin Analytics

- Total students.
- Active clubs.
- Event count.
- Registration count.
- Participation rate.
- Club activity.
- Basic engagement trends.

---

## 7. MVP Scope

The first working version should contain only:

1. Authentication.
2. Student profile.
3. Club directory.
4. Club details.
5. Join/follow club.
6. Organizer dashboard.
7. Event creation.
8. Event registration.
9. Attendance.
10. Announcements.
11. Basic notifications.
12. Activity history.

AI recommendations, advanced analytics, club collaboration, and project matching should be introduced after the core workflow works reliably.

---

## 8. Success Criteria

The MVP is successful when:

- A student can discover and join a club.
- An organizer can manage members.
- An organizer can create an event.
- A student can register for the event.
- Attendance can be recorded.
- Students can see their participation history.
- Admin can see basic campus activity.
- Each role can access only permitted features.

---

## 9. Out of Scope for Initial MVP

- Paid subscriptions.
- Complex ERP features.
- Native Android/iOS apps.
- Advanced AI agents.
- Full real-time chat.
- Payment gateway.
- Complex recommendation models.
- Automated skill verification.
- Large-scale multi-college deployment.

These can be considered later.

---

## 10. Product Principle

> **Build the reliable campus engagement foundation first. Add intelligence only after the underlying data and workflows are reliable.**
