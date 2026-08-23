import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  GraduationCap,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Badge } from '@/components/ui'
import { cn, getInitials } from '@/lib/utils'
import {
  APP_NAME,
  ROLE_LABELS,
  ROLE_DASHBOARD_ROUTES,
  STUDENT_NAV_ITEMS,
  ORGANIZER_NAV_ITEMS,
  FACULTY_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
} from '@/constants'
import type { UserRole } from '@/types'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentRole: UserRole = role || profile?.role || 'student'
  const roleDashboard = ROLE_DASHBOARD_ROUTES[currentRole] || '/student/dashboard'
  const roleLabel = ROLE_LABELS[currentRole] || 'Student'

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  // Determine navigation items based on auth & role
  const navLinks = user
    ? currentRole === 'admin'
      ? ADMIN_NAV_ITEMS
      : currentRole === 'faculty'
        ? FACULTY_NAV_ITEMS
        : currentRole === 'organizer'
          ? ORGANIZER_NAV_ITEMS
          : STUDENT_NAV_ITEMS
    : [
        { label: 'Explore', href: '/' },
        { label: 'Clubs', href: '/clubs' },
        { label: 'Events', href: '/events' },
        { label: 'Projects', href: '/projects' },
      ]

  const userDisplayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = getInitials(userDisplayName)

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E5DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 bg-[#181512] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-5 w-5 text-[#E05326]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-[#181512] tracking-tight leading-none">
                {APP_NAME}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E05326] font-semibold">
                UIET MDU Rohtak
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#EFE9DF]/80 p-1.5 rounded-full border border-[#E2DAD0]">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150',
                    isActive
                      ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                      : 'text-stone-700 hover:text-[#181512] hover:bg-white/60'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-[#FDFCFA] border border-[#E5DFD5] hover:border-stone-400 hover:bg-[#F2ECE1] transition-all focus:outline-none focus:ring-2 focus:ring-stone-400/30 cursor-pointer shadow-2xs"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-7 w-7 rounded-full bg-[#181512] text-[#F9F6F0] flex items-center justify-center text-[11px] font-bold">
                    {initials}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-[#181512] leading-tight">
                      {userDisplayName}
                    </p>
                    <p className="text-[10px] font-mono text-[#E05326] font-semibold leading-tight">{roleLabel}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#FDFCFA] rounded-2xl shadow-[0_12px_36px_rgba(24,21,18,0.12)] border border-[#E5DFD5] py-2 z-50 animate-in fade-in-50 duration-150 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#EFE9DF] bg-[#F7F2E8]/40">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500">Signed in as</p>
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {userDisplayName}
                      </p>
                      <div className="mt-1.5">
                        <Badge
                          variant={
                            currentRole === 'admin'
                              ? 'live'
                              : currentRole === 'faculty'
                                ? 'success'
                                : currentRole === 'organizer'
                                  ? 'accent'
                                  : 'default'
                          }
                          className="text-[10px]"
                        >
                          {roleLabel}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={roleDashboard}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#EFE9DF] hover:text-[#181512] transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-stone-500" />
                        Workspace Dashboard
                      </Link>

                      <Link
                        to="/passport"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#EFE9DF] hover:text-[#181512] transition-colors"
                      >
                        <Sparkles className="h-4 w-4 text-[#E05326]" />
                        Activity Passport
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#EFE9DF] hover:text-[#181512] transition-colors"
                      >
                        <User className="h-4 w-4 text-stone-500" />
                        Profile Settings
                      </Link>

                      {currentRole === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#E05326] hover:bg-[#FDF2EE] transition-colors"
                        >
                          <Shield className="h-4 w-4 text-[#E05326]" />
                          Admin Governance
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#EFE9DF] pt-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-stone-800 hover:text-[#181512] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-xs font-semibold text-[#F9F6F0] bg-[#181512] hover:bg-[#2C2724] rounded-full transition-all shadow-xs"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-950 rounded-xl hover:bg-[#EFE9DF] cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden border-t border-[#E5DFD5] py-4 space-y-1.5',
            isMobileMenuOpen ? 'block' : 'hidden'
          )}
        >
          {user && (
            <div className="px-4 py-3 mb-3 bg-[#EFE9DF]/80 rounded-2xl flex items-center gap-3 border border-[#E2DAD0]">
              <div className="h-9 w-9 rounded-full bg-[#181512] text-[#F9F6F0] flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{userDisplayName}</p>
                <p className="text-xs font-mono text-[#E05326] font-semibold">{roleLabel}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                location.pathname === link.href
                  ? 'bg-[#181512] text-[#F9F6F0]'
                  : 'text-stone-700 hover:bg-[#EFE9DF]'
              )}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-2 border-t border-[#E5DFD5] space-y-1">
              <Link
                to={roleDashboard}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-[#EFE9DF] rounded-xl"
              >
                Dashboard
              </Link>
              <Link
                to="/passport"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-[#EFE9DF] rounded-xl"
              >
                Activity Passport
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-[#EFE9DF] rounded-xl"
              >
                Profile Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#E5DFD5] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-stone-800 bg-[#EFE9DF] rounded-full"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#F9F6F0] bg-[#181512] rounded-full"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
