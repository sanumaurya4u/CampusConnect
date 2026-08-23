import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  Users,
  School,
  Calendar,
  BarChart2,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Search,
  Layers,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { adminService, type AdminMetrics } from '@/services/admin.service'
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Input,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui'
import { AnalyticsDashboard } from '@/components/analytics'
import { useDocumentTitle } from '@/hooks'
import { formatDate, getInitials } from '@/lib/utils'
import { CLUB_CATEGORIES } from '@/constants'
import type { Profile, Club, CampusEvent, UserRole } from '@/types'

type AdminTab = 'overview' | 'users' | 'clubs' | 'events' | 'reports'

export function AdminDashboard() {
  useDocumentTitle('Institutional Administration & Governance')
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  // Metrics & reports
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalStudents: 0,
    totalOrganizers: 0,
    totalFaculty: 0,
    totalClubs: 0,
    activeClubsCount: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttended: 0,
    totalProjects: 0,
    totalActivitiesLogged: 0,
  })

  // Data lists
  const [users, setUsers] = useState<Profile[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [events, setEvents] = useState<CampusEvent[]>([])

  // Filters & State
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userSearch, setUserSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Register New Club Modal
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false)
  const [newClubName, setNewClubName] = useState('')
  const [newClubCategory, setNewClubCategory] = useState<string>(CLUB_CATEGORIES[0] || 'AI & Data Science')
  const [newClubDescription, setNewClubDescription] = useState('')
  const [newClubFaculty, setNewClubFaculty] = useState('')
  const [newClubObjective, setNewClubObjective] = useState('')
  const [newClubActivities, setNewClubActivities] = useState('')
  const [isCreatingClub, setIsCreatingClub] = useState(false)
  const [createClubError, setCreateClubError] = useState<string | null>(null)

  // Edit Faculty / Club Modal
  const [clubToEdit, setClubToEdit] = useState<Club | null>(null)
  const [editFacultyName, setEditFacultyName] = useState('')
  const [editClubDesc, setEditClubDesc] = useState('')
  const [isUpdatingClub, setIsUpdatingClub] = useState(false)

  // Role Switcher Confirmation
  const [userRoleToChange, setUserRoleToChange] = useState<{
    user: Profile
    newRole: UserRole
  } | null>(null)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)

  const loadAdminData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [metricsData, usersData, clubsData, eventsData] = await Promise.all([
        adminService.getAdminMetrics(),
        adminService.getAllUsers({ role: userRoleFilter, search: userSearch.trim() || undefined }),
        adminService.getAllClubs(),
        adminService.getAllCampusEvents(),
      ])

      setMetrics(metricsData)
      setUsers(usersData)
      setClubs(clubsData)
      setEvents(eventsData)
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userRoleFilter, userSearch])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  // Handle User Role Change
  const handleConfirmRoleChange = async () => {
    if (!userRoleToChange) return
    setIsUpdatingRole(true)
    try {
      await adminService.updateUserRole(userRoleToChange.user.id, userRoleToChange.newRole)
      setUserRoleToChange(null)
      await loadAdminData()
    } catch (err) {
      console.error('Failed to update user role:', err)
    } finally {
      setIsUpdatingRole(false)
    }
  }

  // Handle Toggle Club Status (Active / Paused)
  const handleToggleClubStatus = async (club: Club) => {
    try {
      await adminService.toggleClubStatus(club.id, !club.is_active)
      await loadAdminData()
    } catch (err) {
      console.error('Failed to toggle club status:', err)
    }
  }

  // Handle Create Club
  const handleCreateClub = async (e: FormEvent) => {
    e.preventDefault()
    if (!newClubName.trim()) return

    setIsCreatingClub(true)
    setCreateClubError(null)

    try {
      await adminService.createClub({
        name: newClubName.trim(),
        category: newClubCategory,
        description: newClubDescription.trim(),
        facultyIncharge: newClubFaculty.trim() || undefined,
        objective: newClubObjective.trim() || undefined,
        activities: newClubActivities.trim() || undefined,
      })

      setIsCreateClubModalOpen(false)
      setNewClubName('')
      setNewClubDescription('')
      setNewClubFaculty('')
      setNewClubObjective('')
      setNewClubActivities('')
      await loadAdminData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create club.'
      setCreateClubError(msg)
    } finally {
      setIsCreatingClub(false)
    }
  }

  // Handle Open Edit Club
  const handleOpenEditClub = (club: Club) => {
    setClubToEdit(club)
    setEditFacultyName(club.faculty_incharge || '')
    setEditClubDesc(club.description || '')
  }

  const handleUpdateClub = async (e: FormEvent) => {
    e.preventDefault()
    if (!clubToEdit) return

    setIsUpdatingClub(true)
    try {
      await adminService.updateClub(clubToEdit.id, {
        faculty_incharge: editFacultyName.trim() || null,
        description: editClubDesc.trim(),
      })
      setClubToEdit(null)
      await loadAdminData()
    } catch (err) {
      console.error('Failed to update club:', err)
    } finally {
      setIsUpdatingClub(false)
    }
  }

  // Handle Event Moderation
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel and remove this campus event?')) return
    try {
      await adminService.deleteEvent(eventId)
      await loadAdminData()
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Institutional Administration Suite..." />
      </div>
    )
  }

  const adminName = profile?.full_name || 'Dr. Admin UIET'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Admin Header Banner */}
      <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05326]/20 border border-[#E05326]/40 text-[#E05326] text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>UIET Institutional Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Welcome, {adminName}</h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Dean &amp; Administration Control Suite — manage user roles, supervise clubs, sanction campus events, and review university accreditation analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            size="sm"
            onClick={() => setIsCreateClubModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-white text-[#181512] hover:bg-stone-200 border-white font-semibold"
          >
            Provision Society
          </Button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-[#E5DFD5]">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Layers },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'clubs', label: `Club Governance (${clubs.length})`, icon: School },
            { id: 'events', label: `Event Supervision (${events.length})`, icon: Calendar },
            { id: 'reports', label: 'Engagement Reports', icon: BarChart2 },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-3 px-3.5 border-b-2 text-xs font-mono uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#E05326] text-[#E05326] font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-400'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#E05326]' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="editorial-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                  Total Students
                </p>
                <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                  <Users className="h-4 w-4 text-[#E05326]" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-stone-900">{metrics.totalStudents}</p>
              <p className="mt-1 text-xs text-stone-500 font-mono">Registered learners</p>
            </div>

            <div className="editorial-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                  Active Societies
                </p>
                <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                  <School className="h-4 w-4 text-[#E05326]" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-stone-900">{metrics.activeClubsCount}</p>
              <p className="mt-1 text-xs text-stone-500 font-mono">of {metrics.totalClubs} registered clubs</p>
            </div>

            <div className="editorial-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                  Campus Events
                </p>
                <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                  <Calendar className="h-4 w-4 text-[#E05326]" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-stone-900">{metrics.totalEvents}</p>
              <p className="mt-1 text-xs text-stone-500 font-mono">{metrics.totalRegistrations} total signups</p>
            </div>

            <div className="editorial-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                  Verified Attendees
                </p>
                <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                  <UserCheck className="h-4 w-4 text-[#E05326]" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-stone-900">{metrics.totalAttended}</p>
              <p className="mt-1 text-xs text-stone-500 font-mono">Accredited attendances</p>
            </div>
          </div>

          {/* Institutional Governance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-base font-bold text-gray-900">System Activity Summary</h2>
                </CardHeader>
                <CardBody className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500">Event Registrations</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalRegistrations}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500">Passport Activities</p>
                      <p className="text-2xl font-bold text-primary mt-1">{metrics.totalActivitiesLogged}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500">Appointed Organizers</p>
                      <p className="text-2xl font-bold text-secondary mt-1">{metrics.totalOrganizers}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      UIET Campus Connect &bull; Institutional System v1.0
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('reports')}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      View Reports
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold">Institutional Security</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  System administrators have verified privileges to re-assign club coordinators, sanction multi-club events, and manage student activity records.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER GOVERNANCE */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">User Role Governance</h2>
              <p className="text-xs text-gray-500">
                Manage student, organizer, faculty, and administrator privileges across the institution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* User Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user or department..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="organizer">Organizers</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Current Role</th>
                    <th className="px-6 py-3">Registered On</th>
                    <th className="px-6 py-3 text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const initials = getInitials(u.full_name || 'User')
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                              {u.full_name || 'Student'}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-700">
                          {u.department || 'General'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'error'
                                : u.role === 'faculty'
                                  ? 'warning'
                                  : u.role === 'organizer'
                                    ? 'primary'
                                    : 'default'
                            }
                            className="text-xs uppercase font-bold"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              setUserRoleToChange({
                                user: u,
                                newRole: e.target.value as UserRole,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* TAB 3: CLUB GOVERNANCE */}
      {activeTab === 'clubs' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Official Campus Societies ({clubs.length})
              </h2>
              <p className="text-xs text-gray-500">
                Approve, suspend, assign faculty supervisors, and monitor club health.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateClubModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Provision Society
            </Button>
          </CardHeader>

          <CardBody className="p-0">
            <div className="divide-y divide-gray-100">
              {clubs.map((club) => {
                const isClubActive = club.status === 'active' || (club as any).is_active === true
                return (
                  <div
                    key={club.id}
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{club.name}</h3>
                        <Badge variant="primary" className="text-xs">
                          {club.category}
                        </Badge>
                        <Badge
                          variant={isClubActive ? 'success' : 'default'}
                          className="text-xs uppercase font-bold"
                        >
                          {isClubActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{club.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                        <span className="font-semibold text-gray-700">
                          Faculty In-Charge: {club.faculty_incharge || 'Not Assigned'}
                        </span>
                        <span>&bull; {club.member_count || 0} Registered Members</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleOpenEditClub(club)}
                        leftIcon={<Edit className="h-3.5 w-3.5" />}
                      >
                        Edit &amp; Assign
                      </Button>
                      <Button
                        size="sm"
                        variant={isClubActive ? 'outline' : 'primary'}
                        className="text-xs"
                        onClick={() => handleToggleClubStatus(club)}
                      >
                        {isClubActive ? 'Pause Club' : 'Activate Club'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* TAB 4: EVENT SUPERVISION */}
      {activeTab === 'events' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                University Event Supervision ({events.length})
              </h2>
              <p className="text-xs text-gray-500">
                Oversee campus-wide workshops, hackathons, and guest seminars.
              </p>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            {events.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-10 w-10 text-gray-400" />}
                title="No events scheduled"
                description="Events created by club coordinators will appear here for administrative oversight."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{ev.title}</h3>
                        <Badge variant="secondary" className="text-xs uppercase">
                          {ev.event_type}
                        </Badge>
                        <Badge variant="primary" className="text-xs">
                          {ev.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        Organized by{' '}
                        <strong className="text-gray-900">{ev.club?.name || 'UIET Society'}</strong>
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                        <span>{formatDate(ev.start_time)}</span>
                        <span>&bull; Venue: {ev.venue}</span>
                        <span className="font-semibold text-emerald-700">
                          &bull; {ev.registration_count || 0} Registered
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/events/${ev.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Pass
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        onClick={() => handleDeleteEvent(ev.id)}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        Cancel Event
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 5: ENGAGEMENT REPORTS & ACCREDITATION INTELLIGENCE */}
      {activeTab === 'reports' && (
        <AnalyticsDashboard />
      )}

      {/* Provision New Society Modal */}
      <Modal
        isOpen={isCreateClubModalOpen}
        onClose={() => setIsCreateClubModalOpen(false)}
        title="Provision Official UIET Student Society"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          {createClubError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-error">
              {createClubError}
            </div>
          )}

          <Input
            label="Society / Club Name"
            type="text"
            placeholder="e.g. Cybersecurity & Ethical Hacking Club"
            value={newClubName}
            onChange={(e) => setNewClubName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={newClubCategory}
              onChange={(e) => setNewClubCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CLUB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Faculty In-Charge Supervisor (Optional)"
            type="text"
            placeholder="e.g. Dr. Rajesh Kumar, Assistant Professor"
            value={newClubFaculty}
            onChange={(e) => setNewClubFaculty(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Overview of the society's mission and technical domain..."
              value={newClubDescription}
              onChange={(e) => setNewClubDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Objective</label>
            <textarea
              rows={2}
              placeholder="Core mission and goals for student members..."
              value={newClubObjective}
              onChange={(e) => setNewClubObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateClubModalOpen(false)}
              disabled={isCreatingClub}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isCreatingClub}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Provision Society
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty / Club Modal */}
      <Modal
        isOpen={Boolean(clubToEdit)}
        onClose={() => setClubToEdit(null)}
        title={`Edit Society — ${clubToEdit?.name || 'Club'}`}
      >
        <form onSubmit={handleUpdateClub} className="space-y-4">
          <Input
            label="Assigned Faculty In-Charge"
            type="text"
            placeholder="e.g. Dr. Rajesh Kumar, CSE Department"
            value={editFacultyName}
            onChange={(e) => setEditFacultyName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={editClubDesc}
              onChange={(e) => setEditClubDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClubToEdit(null)}
              disabled={isUpdatingClub}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isUpdatingClub}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Change Confirmation Modal */}
      <Modal
        isOpen={Boolean(userRoleToChange)}
        onClose={() => setUserRoleToChange(null)}
        title="Confirm Role Re-assignment"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserRoleToChange(null)}
              disabled={isUpdatingRole}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={isUpdatingRole}
              onClick={handleConfirmRoleChange}
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              Confirm Role Change
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to change{' '}
          <strong className="text-gray-900">{userRoleToChange?.user.full_name}</strong>&apos;s role
          from{' '}
          <strong className="text-gray-900 uppercase">{userRoleToChange?.user.role}</strong> to{' '}
          <strong className="text-primary uppercase">{userRoleToChange?.newRole}</strong>?
        </p>
      </Modal>
    </div>
  )
}
