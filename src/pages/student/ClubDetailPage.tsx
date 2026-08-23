import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  School,
  UserCheck,
  LogOut,
  Target,
  Activity,
  Calendar,
  AlertCircle,
  Megaphone,
  Clock,
  Handshake,
  FolderGit2,
  ArrowRight,
  Code2,
} from 'lucide-react'
import { clubService } from '@/services/club.service'
import { announcementService } from '@/services/announcement.service'
import { collaborationService } from '@/services/collaboration.service'
import { projectService } from '@/services/project.service'
import { useAuth } from '@/features/auth'
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Modal,
  LoadingSpinner,
} from '@/components/ui'
import { getInitials, formatDate } from '@/lib/utils'
import type { Club, Announcement, ClubCollaboration, CampusProject } from '@/types'
import { useDocumentTitle } from '@/hooks'

export function ClubDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [club, setClub] = useState<Club | null>(null)
  useDocumentTitle(club?.name ? `${club.name} — Club` : 'Club Details')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [collaborations, setCollaborations] = useState<ClubCollaboration[]>([])
  const [projects, setProjects] = useState<CampusProject[]>([])
  const [membershipStatus, setMembershipStatus] = useState<
    'none' | 'member' | 'coordinator' | 'faculty'
  >('none')
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

  const loadClubData = useCallback(async () => {
    if (!slug) return
    setIsLoading(true)
    try {
      const clubData = await clubService.getClubBySlug(slug)
      setClub(clubData)

      if (clubData) {
        // Fetch published club announcements, public collaborations, and projects
        const [annData, collabData, projData] = await Promise.all([
          announcementService.getClubAnnouncements(clubData.id),
          collaborationService.getPublicClubCollaborations(clubData.id),
          projectService.getProjects({ clubId: clubData.id }),
        ])
        setAnnouncements(annData)
        setCollaborations(collabData)
        setProjects(projData)

        // Check if current user is a member
        if (user?.id) {
          const status = await clubService.getMembershipStatus(clubData.id, user.id)
          setMembershipStatus(status)
        }
      }
    } catch (err) {
      console.error('Failed to load club details:', err)
    } finally {
      setIsLoading(false)
    }
  }, [slug, user?.id])

  useEffect(() => {
    loadClubData()
  }, [loadClubData])

  const handleJoinClub = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/clubs/${slug}` } } })
      return
    }

    if (!club) return

    setIsActionLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      await clubService.joinClub(club.id, user.id)
      setMembershipStatus('member')
      setActionSuccess(`Welcome to ${club.name}! You are now an active member.`)
      // Refresh member count
      setClub((prev) => (prev ? { ...prev, member_count: (prev.member_count || 0) + 1 } : null))
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to join club. Please try again.'
      setActionError(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleLeaveClub = async () => {
    if (!user || !club) return

    setIsActionLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      await clubService.leaveClub(club.id, user.id)
      setMembershipStatus('none')
      setIsLeaveModalOpen(false)
      setActionSuccess(`You have left ${club.name}.`)
      // Refresh member count
      setClub((prev) =>
        prev ? { ...prev, member_count: Math.max(0, (prev.member_count || 1) - 1) } : null
      )
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to leave club. Please try again.'
      setActionError(msg)
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading club details..." />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Club Not Found</h1>
        <p className="text-gray-600 text-sm">
          The club you are looking for does not exist or has been moved.
        </p>
        <Link to="/clubs">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    )
  }

  const initials = getInitials(club.name)
  const isJoined = membershipStatus !== 'none'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/clubs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Clubs</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {club.logo_url ? (
              <img
                src={club.logo_url}
                alt={club.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-white font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
                {initials}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{club.name}</h1>
                <Badge variant="primary" className="text-xs">
                  {club.category}
                </Badge>
                <Badge variant="success" className="text-xs">
                  Official UIET Society
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">{club.description}</p>
            </div>
          </div>

          {/* Membership Actions */}
          <div className="w-full sm:w-auto flex items-center gap-3">
            {isJoined ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="px-3.5 py-2 rounded-xl bg-green-50 border border-green-200 text-success text-xs font-semibold flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  <span>Member ({membershipStatus})</span>
                </div>
                {membershipStatus === 'member' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-error"
                    onClick={() => setIsLeaveModalOpen(true)}
                  >
                    Leave
                  </Button>
                )}
              </div>
            ) : (
              <Button
                size="md"
                className="w-full sm:w-auto shadow-sm"
                isLoading={isActionLoading}
                onClick={handleJoinClub}
                leftIcon={<Users className="h-4 w-4" />}
              >
                {user ? 'Join Club' : 'Sign in to Join'}
              </Button>
            )}
          </div>
        </div>

        {/* Action Status Feedback */}
        {actionSuccess && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Meta Stats Bar */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="h-4 w-4 text-primary" />
            <span>{club.member_count ?? 0} Student Members</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-4 w-4 text-secondary" />
            <span>University Institute of Engineering & Technology (UIET)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details, Announcements & Leadership */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Objective, Activities & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objective Card */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-gray-900">Club Objective</h2>
            </CardHeader>
            <CardBody className="p-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {club.objective || 'Objective details being updated by the club coordinators.'}
              </p>
            </CardBody>
          </Card>

          {/* Activities Card */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              <h2 className="text-base font-bold text-gray-900">Key Roles & Core Activities</h2>
            </CardHeader>
            <CardBody className="p-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {club.activities || 'Activities list being updated by the club coordinators.'}
              </p>
            </CardBody>
          </Card>

          {/* Cross-Club Collaborations & Joint Initiatives */}
          {collaborations.length > 0 && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Joint Initiatives &amp; Collaborations ({collaborations.length})
                  </h2>
                </div>
                <Badge variant="primary" className="text-xs">
                  Active Partnerships
                </Badge>
              </CardHeader>
              <CardBody className="p-0 divide-y divide-gray-100">
                {collaborations.map((collab) => {
                  const partner =
                    collab.initiator_club_id === club.id
                      ? collab.target_club
                      : collab.initiator_club
                  return (
                    <div key={collab.id} className="p-6 space-y-2 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-gray-900">{collab.title}</h3>
                        {partner && (
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                            Co-Hosted with {partner.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                        {collab.description}
                      </p>
                      {collab.proposed_dates && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span>Timeline: {collab.proposed_dates}</span>
                        </p>
                      )}
                    </div>
                  )
                })}
              </CardBody>
            </Card>
          )}

          {/* Club Development Projects Section */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Development Projects &amp; Initiatives ({projects.length})
                </h2>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                View Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {projects.length === 0 ? (
                <p className="text-xs text-gray-400 p-6 text-center">
                  No active projects posted by {club.name} yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-6 space-y-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <Link
                            to={`/projects/${proj.id}`}
                            className="text-base font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <span>{proj.title}</span>
                            <Badge variant="primary" className="text-xs font-normal">
                              {proj.category}
                            </Badge>
                          </Link>
                          <p className="text-xs text-gray-600 line-clamp-2">{proj.description}</p>
                        </div>
                        <Link to={`/projects/${proj.id}`}>
                          <Button size="sm" variant="outline" className="text-xs shrink-0">
                            Apply / View
                          </Button>
                        </Link>
                      </div>

                      {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <Code2 className="h-3.5 w-3.5 text-gray-400" />
                          {proj.tech_stack.slice(0, 5).map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-mono"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {proj.open_roles && proj.open_roles.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                          <span className="font-semibold text-emerald-700">
                            {proj.open_roles.length} Open Positions:
                          </span>
                          <span className="truncate">
                            {proj.open_roles.map((r) => r.role).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Official Announcements Card */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-gray-900">
                  Official Announcements ({announcements.length})
                </h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                Live Feed
              </Badge>
            </CardHeader>
            <CardBody className="p-0">
              {announcements.length === 0 ? (
                <p className="text-xs text-gray-400 p-6 text-center">
                  No notices published by {club.name} yet. Check back soon for event updates!
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-6 space-y-2 hover:bg-gray-50/40 transition-colors">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">{ann.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                        {ann.content}
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-2 pt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(ann.published_at)}</span>
                        {ann.author && <span>&bull; Posted by {ann.author.full_name}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Faculty & Student Coordinators */}
        <div className="space-y-6">
          {/* Faculty In-Charge */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-gray-900">Faculty In-Charge</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-2">
              <p className="text-sm font-bold text-gray-900">
                {club.faculty_incharge || 'Faculty coordinator details being updated.'}
              </p>
              <p className="text-xs text-gray-500">
                Department Mentor &amp; Institutional Oversight
              </p>
            </CardBody>
          </Card>

          {/* Student Coordinators Roster */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              <h3 className="text-sm font-bold text-gray-900">Student Coordinators</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              {club.coordinators && club.coordinators.length > 0 ? (
                club.coordinators.map((coordinator, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="h-9 w-9 rounded-full bg-secondary/10 text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(coordinator.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {coordinator.name}
                      </p>
                      {coordinator.branch && (
                        <p className="text-xs text-gray-500 truncate">{coordinator.branch}</p>
                      )}
                      {coordinator.roll_no && (
                        <p className="text-[11px] text-gray-400">Roll No: {coordinator.roll_no}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">Coordinator details being updated.</p>
              )}
            </CardBody>
          </Card>

          {/* Campus Connect Guarantee */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-xs text-indigo-900">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Verified Campus Experience
            </p>
            <p className="text-indigo-700">
              Active participation and attendance in {club.name} events directly credit your Activity
              Passport.
            </p>
          </div>
        </div>
      </div>

      {/* Leave Club Confirmation Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Leave Club Confirmation"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLeaveModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isActionLoading}
              onClick={handleLeaveClub}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Confirm & Leave
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to leave <strong className="text-gray-900">{club.name}</strong>? You
          can re-join at any time from the club directory.
        </p>
      </Modal>
    </div>
  )
}
