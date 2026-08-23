import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui'
import { ROLE_DASHBOARD_ROUTES, ROLE_LABELS } from '@/constants'
import type { UserRole } from '@/types'

export function UnauthorizedPage() {
  const { profile, role } = useAuth()

  const currentRole: UserRole = role || profile?.role || 'student'
  const targetDashboard = ROLE_DASHBOARD_ROUTES[currentRole] || '/student/dashboard'
  const roleName = ROLE_LABELS[currentRole] || currentRole

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-error">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-error bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Access Restricted
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
            Permission Required
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You are signed in as a <span className="font-semibold text-gray-900">{roleName}</span>. You do not have permission to view or manage this section.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={targetDashboard} className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto"
              leftIcon={<LayoutDashboard className="h-4 w-4" />}
            >
              Go to Your Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
