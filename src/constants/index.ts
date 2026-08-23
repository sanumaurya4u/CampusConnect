// Application constants
export const APP_NAME = 'Campus Connect'
export const APP_TAGLINE = 'Discover. Participate. Collaborate.'
export const APP_DESCRIPTION = 'A centralized campus engagement platform connecting students with clubs, events, projects, and opportunities.'

// Roles
export const ROLES = ['student', 'organizer', 'faculty', 'admin'] as const
export type AppRole = typeof ROLES[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  student: 'Student',
  organizer: 'Club Organizer',
  faculty: 'Faculty In-Charge',
  admin: 'Administrator',
}

export const ROLE_DASHBOARD_ROUTES: Record<AppRole, string> = {
  student: '/student/dashboard',
  organizer: '/organizer/dashboard',
  faculty: '/faculty/dashboard',
  admin: '/admin/dashboard',
}

// UIET Departments (based on real UIET MDU structure from prototype)
export const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Artificial Intelligence & Machine Learning (AIML)',
  'Biotechnology (BT)',
  'Electrical Engineering (EE)',
  'Electronics & Communication Engineering (ECE)',
  'Mechanical Engineering (ME)',
  'Applied Sciences & Humanities',
  'Research Scholar',
] as const

// Academic Semesters
export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
] as const

// Club categories based on UIET prototype
export const CLUB_CATEGORIES = [
  'AI & Data Science',
  'Design & Digital Content',
  'DSA & Coding',
  'Career Preparation',
  'Mathematics',
  'Wellness',
  'Innovation & Projects',
  'Public Speaking & Debates',
] as const

export type ClubCategory = typeof CLUB_CATEGORIES[number]

// Student Interests & Skills
export const AVAILABLE_INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning & Data Science',
  'Competitive Coding (DSA)',
  'Web & App Development',
  'UI/UX & Graphic Design',
  'Video Editing & Media',
  'Robotics & Embedded Systems',
  'Interview Prep & Resume Building',
  'Public Speaking & Debates',
  'Mathematics & Logic',
  'Yoga & Mental Wellness',
  'Biotechnology & Research',
] as const

// Student Goals
export const AVAILABLE_GOALS = [
  'Win Hackathons & Coding Contests',
  'Learn New Technical Skills',
  'Prepare for Campus Placements',
  'Gain Leadership & Event Experience',
  'Collaborate on Innovative Projects',
  'Connect with Campus Peers & Mentors',
] as const

// Navigation items per role
export const STUDENT_NAV_ITEMS = [
  { label: 'Clubs', href: '/clubs' },
  { label: 'Events', href: '/events' },
  { label: 'Projects', href: '/projects' },
  { label: 'Passport', href: '/passport' },
  { label: 'Dashboard', href: '/student/dashboard' },
] as const

export const ORGANIZER_NAV_ITEMS = [
  { label: 'Organizer Hub', href: '/organizer/dashboard' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Events', href: '/events' },
  { label: 'Projects', href: '/projects' },
  { label: 'Passport', href: '/passport' },
] as const

export const FACULTY_NAV_ITEMS = [
  { label: 'Faculty Hub', href: '/faculty/dashboard' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Events', href: '/events' },
  { label: 'Projects', href: '/projects' },
] as const

export const ADMIN_NAV_ITEMS = [
  { label: 'Admin Console', href: '/admin/dashboard' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Events', href: '/events' },
  { label: 'Projects', href: '/projects' },
  { label: 'Passport', href: '/passport' },
] as const

// Design tokens
export const COLORS = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  secondary: '#06B6D4',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
} as const
