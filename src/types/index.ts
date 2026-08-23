// Core User & Authentication Types
export type UserRole = 'student' | 'organizer' | 'faculty' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  department: string | null
  roll_number: string | null
  semester: string | null
  phone: string | null
  bio: string | null
  interests: string[]
  goals?: string[]
  created_at: string
  updated_at: string
}

// Club Discovery & Profile Types
export interface ClubCoordinator {
  name: string
  branch?: string
  roll_no?: string
  contact?: string
}

export interface Club {
  id: string
  name: string
  slug: string
  category: string
  description: string
  logo_url: string | null
  cover_image_url: string | null
  faculty_incharge: string | null
  objective: string | null
  activities: string | null
  coordinators: ClubCoordinator[]
  is_active: boolean
  status?: 'pending' | 'active' | 'archived'
  created_at: string
  updated_at: string
  member_count?: number
}

// Membership & Role Types
export type MembershipRole = 'member' | 'coordinator'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type EventType =
  | 'workshop'
  | 'hackathon'
  | 'seminar'
  | 'competition'
  | 'webinar'
  | 'general'
export type EventStatus = 'published' | 'draft' | 'cancelled'
export type RegistrationStatus = 'registered' | 'cancelled' | 'attended'
export type CollaborationStatus = 'pending' | 'accepted' | 'rejected' | 'completed'
export type ProjectStatus = 'open' | 'active' | 'completed' | 'archived'

// Activity Passport Types
export type ActivityType =
  | 'event'
  | 'project'
  | 'club'
  | 'leadership'
  | 'achievement'
  | 'volunteer'

export type AchievementType =
  | 'participation'
  | 'leadership'
  | 'project'
  | 'event'
  | 'milestone'

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  membership_role: MembershipRole
  joined_at: string
  club?: Club
  profile?: Profile
}

export interface ClubApplication {
  id: string
  club_id: string
  applicant_id: string
  status: ApplicationStatus
  message: string | null
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  club?: Club
  applicant?: Profile
}

// Announcement Types
export type AnnouncementStatus = 'draft' | 'published' | 'archived'

export interface Announcement {
  id: string
  club_id: string | null
  title: string
  content: string
  status: AnnouncementStatus
  created_by: string
  published_at: string
  created_at: string
  updated_at: string
  club?: Club
  author?: Profile
}

// Campus Event
export interface CampusEvent {
  id: string
  club_id: string
  title: string
  description: string
  category: string
  event_type: EventType
  venue: string
  start_time: string
  end_time: string
  registration_deadline?: string | null
  max_capacity: number | null
  banner_url: string | null
  tags: string[]
  status: EventStatus
  created_by: string
  created_at: string
  updated_at: string
  club?: Club
  author?: Profile
  registration_count?: number
}

// Event Registration
export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: RegistrationStatus
  registered_at: string
  check_in_at: string | null
  event?: CampusEvent
  profile?: Profile
}

// Club Collaboration
export interface ClubCollaboration {
  id: string
  initiator_club_id: string
  target_club_id: string
  event_id: string | null
  title: string
  description: string
  proposed_dates: string | null
  status: CollaborationStatus
  initiator_notes: string | null
  target_response: string | null
  created_by: string
  created_at: string
  updated_at: string
  initiator_club?: Club
  target_club?: Club
  event?: CampusEvent
  proposer?: Profile
}

// Project Open Role
export interface ProjectRole {
  role: string
  slots: number
  filled: number
  skills: string[]
}

// Campus Project
export interface CampusProject {
  id: string
  club_id: string
  title: string
  description: string
  category: string
  status: ProjectStatus
  open_roles: ProjectRole[]
  tech_stack: string[]
  github_url: string | null
  demo_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  club?: Club
  author?: Profile
  application_count?: number
}

// Project Application
export interface ProjectApplication {
  id: string
  project_id: string
  applicant_id: string
  role_applied: string
  skills_summary: string | null
  statement_of_interest: string
  portfolio_links: string | null
  status: ApplicationStatus
  reviewer_notes: string | null
  reviewed_by: string | null
  created_at: string
  reviewed_at: string | null
  project?: CampusProject
  applicant?: Profile
}

// Student Activity (Activity Passport Timeline)
export interface StudentActivity {
  id: string
  user_id: string
  activity_type: ActivityType
  reference_id: string | null
  title: string
  metadata: Record<string, unknown>
  occurred_at: string
  created_at: string
}

// Student Achievement / Badge
export interface StudentAchievement {
  id: string
  user_id: string
  title: string
  description: string
  achievement_type: AchievementType
  badge_key: string
  badge_icon: string
  awarded_at: string
  metadata: Record<string, unknown>
}

// Passport Aggregate Summary
export interface PassportSummary {
  totalClubs: number
  eventsAttended: number
  projectsContributed: number
  totalCredits: number
  badgesEarned: number
  skillsLearned: string[]
}

// Club Operations Stats
export interface ClubStats {
  totalMembers: number
  pendingApplications: number
  totalAnnouncements: number
}
