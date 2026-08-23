import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import { LoadingSpinner } from '@/components/ui'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

// Lazy loaded page components
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const SignupPage = lazy(() =>
  import('@/pages/auth/SignupPage').then((m) => ({ default: m.SignupPage }))
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/auth/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage }))
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)
const StudentDashboard = lazy(() =>
  import('@/pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
)
const OrganizerDashboard = lazy(() =>
  import('@/pages/organizer/OrganizerDashboard').then((m) => ({ default: m.OrganizerDashboard }))
)
const FacultyDashboard = lazy(() =>
  import('@/pages/faculty/FacultyDashboard').then((m) => ({ default: m.FacultyDashboard }))
)
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
)
const ClubDirectoryPage = lazy(() =>
  import('@/pages/student/ClubDirectoryPage').then((m) => ({ default: m.ClubDirectoryPage }))
)
const ClubDetailPage = lazy(() =>
  import('@/pages/student/ClubDetailPage').then((m) => ({ default: m.ClubDetailPage }))
)
const EventsDirectoryPage = lazy(() =>
  import('@/pages/student/EventsDirectoryPage').then((m) => ({ default: m.EventsDirectoryPage }))
)
const EventDetailPage = lazy(() =>
  import('@/pages/student/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
)
const ProjectsDirectoryPage = lazy(() =>
  import('@/pages/student/ProjectsDirectoryPage').then((m) => ({ default: m.ProjectsDirectoryPage }))
)
const ProjectDetailPage = lazy(() =>
  import('@/pages/student/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
)
const ActivityPassportPage = lazy(() =>
  import('@/pages/student/ActivityPassportPage').then((m) => ({ default: m.ActivityPassportPage }))
)

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" label="Loading Campus Connect..." />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Public discovery routes
      {
        path: '/',
        element: (
          <LazyWrapper>
            <LandingPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/clubs',
        element: (
          <LazyWrapper>
            <ClubDirectoryPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/clubs/:slug',
        element: (
          <LazyWrapper>
            <ClubDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/events',
        element: (
          <LazyWrapper>
            <EventsDirectoryPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/events/:id',
        element: (
          <LazyWrapper>
            <EventDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/projects',
        element: (
          <LazyWrapper>
            <ProjectsDirectoryPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/projects/:id',
        element: (
          <LazyWrapper>
            <ProjectDetailPage />
          </LazyWrapper>
        ),
      },

      // Auth routes
      {
        path: '/login',
        element: (
          <LazyWrapper>
            <LoginPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/signup',
        element: (
          <LazyWrapper>
            <SignupPage />
          </LazyWrapper>
        ),
      },
      {
        path: '/unauthorized',
        element: (
          <LazyWrapper>
            <UnauthorizedPage />
          </LazyWrapper>
        ),
      },

      // Authenticated common routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: (
              <LazyWrapper>
                <ProfilePage />
              </LazyWrapper>
            ),
          },
          {
            path: '/passport',
            element: (
              <LazyWrapper>
                <ActivityPassportPage />
              </LazyWrapper>
            ),
          },
        ],
      },

      // Student Workspace (Student & Admin)
      {
        element: <RoleRoute allowedRoles={['student', 'admin']} />,
        children: [
          {
            path: '/student/dashboard',
            element: (
              <LazyWrapper>
                <StudentDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: '/student/passport',
            element: (
              <LazyWrapper>
                <ActivityPassportPage />
              </LazyWrapper>
            ),
          },
        ],
      },

      // Organizer Workspace (Organizer & Admin)
      {
        element: <RoleRoute allowedRoles={['organizer', 'admin']} />,
        children: [
          {
            path: '/organizer/dashboard',
            element: (
              <LazyWrapper>
                <OrganizerDashboard />
              </LazyWrapper>
            ),
          },
        ],
      },

      // Faculty Workspace (Faculty & Admin)
      {
        element: <RoleRoute allowedRoles={['faculty', 'admin']} />,
        children: [
          {
            path: '/faculty/dashboard',
            element: (
              <LazyWrapper>
                <FacultyDashboard />
              </LazyWrapper>
            ),
          },
        ],
      },

      // Institutional Admin Workspace (Admin only)
      {
        element: <RoleRoute allowedRoles={['admin']} />,
        children: [
          {
            path: '/admin/dashboard',
            element: (
              <LazyWrapper>
                <AdminDashboard />
              </LazyWrapper>
            ),
          },
        ],
      },

      // Fallback 404
      {
        path: '*',
        element: (
          <LazyWrapper>
            <NotFoundPage />
          </LazyWrapper>
        ),
      },
    ],
  },
])
