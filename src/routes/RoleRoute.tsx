import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { LoadingSpinner } from '@/components/ui'
import type { UserRole } from '@/types'

interface RoleRouteProps {
  allowedRoles: UserRole[]
  children?: React.ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user, profile, role, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Verifying permissions..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If profile is still resolving or not set yet, check role
  const userRole = role || profile?.role

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ attemptedRole: allowedRoles }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
