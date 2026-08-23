import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  Calendar,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  FolderGit2,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useDocumentTitle } from '@/hooks'
import { clubService } from '@/services/club.service'
import { eventService } from '@/services/event.service'
import { projectService } from '@/services/project.service'
import { Button, Badge, SkeletonCard } from '@/components/ui'
import { PersonalizedDiscoverySection } from '@/components/recommendations'
import type { ClubMember, EventRegistration, ProjectApplication } from '@/types'
import { getInitials, formatDate } from '@/lib/utils'

export function StudentDashboard() {
  useDocumentTitle('Student Hub & Dashboard')
  const { user, profile } = useAuth()
  const [joinedClubs, setJoinedClubs] = useState<ClubMember[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<EventRegistration[]>([])
  const [projectApplications, setProjectApplications] = useState<ProjectApplication[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const [clubsData, eventsData, projectsData] = await Promise.all([
        clubService.getUserClubs(user.id),
        eventService.getUserRegistrations(user.id),
        projectService.getUserProjectApplications(user.id),
      ])
      setJoinedClubs(clubsData)
      setRegisteredEvents(eventsData)
      setProjectApplications(projectsData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Welcome Banner */}
      <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05326]/20 border border-[#E05326]/40 text-[#E05326] text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>UIET Student Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Good Day, {firstName}! 👋</h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Explore active UIET societies, discover upcoming technical sessions, collaborate on campus initiatives, and build your accredited Activity Passport.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link to="/projects">
            <Button
              variant="secondary"
              className="bg-white text-[#181512] hover:bg-stone-200 border-0 shadow-xs font-semibold"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* AI & Interest-Based Recommendations */}
      {user && (
        <PersonalizedDiscoverySection userId={user.id} profile={profile} />
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="editorial-card p-6 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <Compass className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">Browse Societies</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Discover AI, Coding, Robotics, Design, and Wellness clubs at UIET.
            </p>
          </div>
          <Link
            to="/clubs"
            className="pt-4 text-xs font-bold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 font-mono transition-colors"
          >
            <span>View Directory</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="editorial-card p-6 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <Calendar className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">Campus Events</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Register for upcoming hackathons, tech talks, and club sessions.
            </p>
          </div>
          <Link
            to="/events"
            className="pt-4 text-xs font-bold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 font-mono transition-colors"
          >
            <span>Discover Events</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="editorial-card p-6 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <FolderGit2 className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">Projects Hub</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Apply to real-world software, AI, and design initiatives.
            </p>
          </div>
          <Link
            to="/projects"
            className="pt-4 text-xs font-bold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 font-mono transition-colors"
          >
            <span>Explore Projects</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="editorial-card p-6 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <Award className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">Activity Passport</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Track verified attendance, club participation, and leadership credits.
            </p>
          </div>
          <Link
            to="/passport"
            className="pt-4 text-xs font-bold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 font-mono transition-colors"
          >
            <span>View Passport</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Your Project Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-[#E05326]" />
            <h2 className="text-lg font-bold text-stone-900">Your Project Applications</h2>
            <Badge variant="live" className="text-[10px]">
              {projectApplications.length}
            </Badge>
          </div>
          <Link to="/projects" className="text-xs font-mono font-bold text-[#E05326] hover:underline">
            Explore All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard className="h-36" />
            <SkeletonCard className="h-36" />
          </div>
        ) : projectApplications.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F2E8]/50 rounded-2xl border border-dashed border-[#DCD5C9]">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-10 w-10 bg-[#EFE9DF] rounded-full flex items-center justify-center mx-auto text-stone-500">
                <Briefcase className="h-5 w-5 text-[#E05326]" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                No active project applications
              </h3>
              <p className="text-xs text-stone-500">
                Browse open campus development projects to apply for software or design positions.
              </p>
              <Link to="/projects">
                <Button size="sm" className="mt-1">
                  Browse Campus Projects
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectApplications.map((app) => {
              const proj = app.project
              if (!proj) return null
              return (
                <div key={app.id} className="editorial-card p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="editorial-tag text-[10px] font-mono">
                        {app.role_applied}
                      </span>
                      <Badge
                        variant={
                          app.status === 'approved'
                            ? 'success'
                            : app.status === 'rejected'
                              ? 'error'
                              : 'warning'
                        }
                        className="text-[10px] uppercase font-mono font-bold"
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{proj.title}</h4>
                    {proj.club && (
                      <p className="text-xs font-mono text-[#E05326] mt-0.5">{proj.club.name}</p>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-stone-500 pt-2 border-t border-[#EFE9DF] font-mono">
                    <p className="flex items-center gap-1.5 text-[10px]">
                      <Clock className="h-3 w-3 text-stone-400" />
                      Applied on {formatDate(app.created_at)}
                    </p>
                    {app.reviewer_notes && (
                      <p className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200 mt-1">
                        <strong>Feedback:</strong> {app.reviewer_notes}
                      </p>
                    )}
                  </div>

                  <Link to={`/projects/${proj.id}`} className="pt-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      View Project
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Your Registered Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#E05326]" />
            <h2 className="text-lg font-bold text-stone-900">Your Registered Events</h2>
            <Badge variant="live" className="text-[10px]">
              {registeredEvents.length}
            </Badge>
          </div>
          <Link to="/events" className="text-xs font-mono font-bold text-[#E05326] hover:underline">
            Explore All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard className="h-36" />
            <SkeletonCard className="h-36" />
          </div>
        ) : registeredEvents.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F2E8]/50 rounded-2xl border border-dashed border-[#DCD5C9]">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-10 w-10 bg-[#EFE9DF] rounded-full flex items-center justify-center mx-auto text-stone-500">
                <Calendar className="h-5 w-5 text-[#E05326]" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">No events registered yet</h3>
              <p className="text-xs text-stone-500">
                Explore hands-on workshops, hackathons, and seminars to build your skills.
              </p>
              <Link to="/events">
                <Button size="sm" className="mt-1">
                  Browse Campus Events
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map((reg) => {
              const ev = reg.event
              if (!ev) return null
              return (
                <div
                  key={reg.id}
                  className="editorial-card p-5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono font-bold">
                        {ev.event_type}
                      </Badge>
                      <Badge variant="success" className="text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmed
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{ev.title}</h4>
                    {ev.club && (
                      <p className="text-xs font-mono text-[#E05326] mt-0.5 truncate">{ev.club.name}</p>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-stone-500 pt-2 border-t border-[#EFE9DF] font-mono">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      {formatDate(ev.start_time)}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#E05326]" />
                      {ev.venue}
                    </p>
                  </div>

                  <Link to={`/events/${ev.id}`} className="pt-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      View Event Pass
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Your Joined Clubs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#E05326]" />
            <h2 className="text-lg font-bold text-stone-900">Your Joined Societies</h2>
            <Badge variant="live" className="text-[10px]">
              {joinedClubs.length}
            </Badge>
          </div>
          <Link to="/clubs" className="text-xs font-mono font-bold text-[#E05326] hover:underline">
            Explore All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
        ) : joinedClubs.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F2E8]/50 rounded-2xl border border-dashed border-[#DCD5C9]">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-10 w-10 bg-[#EFE9DF] rounded-full flex items-center justify-center mx-auto text-stone-500">
                <Compass className="h-5 w-5 text-[#E05326]" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">No societies joined yet</h3>
              <p className="text-xs text-stone-500">
                You haven&apos;t joined any clubs yet. Discover UIET clubs and become an active member!
              </p>
              <Link to="/clubs">
                <Button size="sm" className="mt-1">
                  Browse Campus Societies
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedClubs.map((membership) => {
              const club = membership.club
              if (!club) return null
              const initials = getInitials(club.name)
              return (
                <div
                  key={membership.id}
                  className="editorial-card p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[#181512] text-[#F9F6F0] flex items-center justify-center font-bold text-xs shrink-0 border border-stone-800">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-[#E05326] transition-colors">{club.name}</h4>
                      <p className="text-xs font-mono text-stone-500 truncate">{club.category}</p>
                    </div>
                  </div>

                  <Link to={`/clubs/${club.slug}`}>
                    <Button size="sm" variant="outline" className="text-xs px-3">
                      View
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EFE9DF] pb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Student Profile Credentials</h2>
            <p className="text-xs text-stone-500 font-mono">
              University verification status &amp; academic enrollment
            </p>
          </div>
          <Badge variant="live" className="px-3 py-1 flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            ACTIVE LEARNER
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F7F2E8]/60 rounded-xl border border-[#E5DFD5]">
            <p className="text-[10px] text-stone-400 uppercase">Full Name</p>
            <p className="font-bold text-stone-900 text-sm mt-0.5">{profile?.full_name || 'Not set'}</p>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-xl border border-[#E5DFD5]">
            <p className="text-[10px] text-stone-400 uppercase">Department</p>
            <p className="font-bold text-stone-900 text-sm mt-0.5">{profile?.department || 'General'}</p>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-xl border border-[#E5DFD5]">
            <p className="text-[10px] text-stone-400 uppercase">Semester</p>
            <p className="font-bold text-stone-900 text-sm mt-0.5">{profile?.semester || '1st Semester'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
