import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  School,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  UserX,
  Target,
  Activity,
  Calendar,
  MapPin,
  UserCheck,
  Handshake,
  FolderGit2,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useDocumentTitle } from '@/hooks'
import { organizerService } from '@/services/organizer.service'
import { announcementService } from '@/services/announcement.service'
import { eventService } from '@/services/event.service'
import { collaborationService } from '@/services/collaboration.service'
import { projectService } from '@/services/project.service'
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui'
import { formatDate, getInitials } from '@/lib/utils'
import type {
  Club,
  ClubMember,
  ClubApplication,
  Announcement,
  ClubStats,
  ClubCoordinator,
  CampusEvent,
  EventRegistration,
  EventType,
  ClubCollaboration,
  CampusProject,
  ProjectApplication,
  ProjectRole,
  ProjectStatus,
} from '@/types'

type DashboardTab =
  | 'overview'
  | 'events'
  | 'projects'
  | 'collaborations'
  | 'edit-club'
  | 'members'
  | 'requests'
  | 'announcements'

export function OrganizerDashboard() {
  useDocumentTitle('Club Organizer Workspace')
  const { user, profile, role } = useAuth()

  const [clubs, setClubs] = useState<Club[]>([])
  const [allCampusClubs, setAllCampusClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [stats, setStats] = useState<ClubStats>({
    totalMembers: 0,
    pendingApplications: 0,
    totalAnnouncements: 0,
  })

  // Data states
  const [members, setMembers] = useState<ClubMember[]>([])
  const [applications, setApplications] = useState<ClubApplication[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [projects, setProjects] = useState<CampusProject[]>([])
  const [collaborations, setCollaborations] = useState<ClubCollaboration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTabLoading, setIsTabLoading] = useState(false)

  // Edit club state
  const [editDesc, setEditDesc] = useState('')
  const [editObjective, setEditObjective] = useState('')
  const [editActivities, setEditActivities] = useState('')
  const [editFaculty, setEditFaculty] = useState('')
  const [editCoordinators, setEditCoordinators] = useState<ClubCoordinator[]>([])
  const [isSavingClub, setIsSavingClub] = useState(false)
  const [clubSaveMessage, setClubSaveMessage] = useState<string | null>(null)
  const [clubSaveError, setClubSaveError] = useState<string | null>(null)

  // Announcement Modal states
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementContent, setAnnouncementContent] = useState('')
  const [announcementStatus, setAnnouncementStatus] = useState<'published' | 'draft'>('published')
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null)
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false)

  // Event Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventType, setEventType] = useState<EventType>('workshop')
  const [eventVenue, setEventVenue] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventMaxCapacity, setEventMaxCapacity] = useState<string>('')
  const [eventTags, setEventTags] = useState('')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isSavingEvent, setIsSavingEvent] = useState(false)

  // Project Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectCategory, setProjectCategory] = useState('')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('open')
  const [projectTechStack, setProjectTechStack] = useState('')
  const [projectGithubUrl, setProjectGithubUrl] = useState('')
  const [projectDemoUrl, setProjectDemoUrl] = useState('')
  const [projectOpenRoles, setProjectOpenRoles] = useState<ProjectRole[]>([])
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [isSavingProject, setIsSavingProject] = useState(false)

  // Project Applicants Modal states
  const [selectedProjectForApplicants, setSelectedProjectForApplicants] =
    useState<CampusProject | null>(null)
  const [projectApplicants, setProjectApplicants] = useState<ProjectApplication[]>([])
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false)

  // Collaboration Modal states
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false)
  const [collabTargetClubId, setCollabTargetClubId] = useState('')
  const [collabTitle, setCollabTitle] = useState('')
  const [collabDescription, setCollabDescription] = useState('')
  const [collabDates, setCollabDates] = useState('')
  const [collabNotes, setCollabNotes] = useState('')
  const [isSavingCollab, setIsSavingCollab] = useState(false)
  const [collabError, setCollabError] = useState<string | null>(null)

  // Collaboration Response Modal states
  const [collabToRespond, setCollabToRespond] = useState<{
    collab: ClubCollaboration
    action: 'accepted' | 'rejected'
  } | null>(null)
  const [collabResponseNote, setCollabResponseNote] = useState('')
  const [isRespondingCollab, setIsRespondingCollab] = useState(false)

  // Attendees Modal states
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<CampusEvent | null>(
    null
  )
  const [attendees, setAttendees] = useState<EventRegistration[]>([])
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false)

  // Member removal modal state
  const [memberToRemove, setMemberToRemove] = useState<ClubMember | null>(null)
  const [isRemovingMember, setIsRemovingMember] = useState(false)

  // Load clubs accessible by this organizer
  const loadOrganizerClubs = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const userRole = role || profile?.role || 'organizer'
      const [clubsList, allClubs] = await Promise.all([
        organizerService.getOrganizerClubs(user.id, userRole),
        organizerService.getOrganizerClubs(user.id, 'admin'),
      ])
      setClubs(clubsList)
      setAllCampusClubs(allClubs)
      if (clubsList.length > 0) {
        setSelectedClub(clubsList[0] ?? null)
      }
    } catch (err) {
      console.error('Failed to load organizer clubs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, role, profile?.role])

  useEffect(() => {
    loadOrganizerClubs()
  }, [loadOrganizerClubs])

  // Load data for the currently selected club
  const loadClubData = useCallback(async () => {
    if (!selectedClub) return
    setIsTabLoading(true)
    try {
      const [
        statsData,
        membersData,
        applicationsData,
        announcementsData,
        eventsData,
        collabData,
        projectsData,
      ] = await Promise.all([
        organizerService.getClubStats(selectedClub.id),
        organizerService.getClubMembersDetailed(selectedClub.id),
        organizerService.getClubApplications(selectedClub.id),
        announcementService.getClubAnnouncements(selectedClub.id, true),
        eventService.getEvents({ clubId: selectedClub.id, timeframe: 'all' }),
        collaborationService.getClubCollaborations(selectedClub.id),
        projectService.getProjects({ clubId: selectedClub.id, status: 'all' }),
      ])

      setStats(statsData)
      setMembers(membersData)
      setApplications(applicationsData)
      setAnnouncements(announcementsData)
      setEvents(eventsData)
      setCollaborations(collabData)
      setProjects(projectsData)

      // Initialize edit fields
      setEditDesc(selectedClub.description || '')
      setEditObjective(selectedClub.objective || '')
      setEditActivities(selectedClub.activities || '')
      setEditFaculty(selectedClub.faculty_incharge || '')
      setEditCoordinators(selectedClub.coordinators || [])
    } catch (err) {
      console.error('Failed to load club details:', err)
    } finally {
      setIsTabLoading(false)
    }
  }, [selectedClub])

  useEffect(() => {
    loadClubData()
  }, [loadClubData])

  // Handle Save Club Profile
  const handleSaveClubProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedClub) return

    setIsSavingClub(true)
    setClubSaveMessage(null)
    setClubSaveError(null)

    try {
      const updated = await organizerService.updateClubProfile(selectedClub.id, {
        description: editDesc.trim(),
        objective: editObjective.trim(),
        activities: editActivities.trim(),
        faculty_incharge: editFaculty.trim(),
        coordinators: editCoordinators.filter((c) => c.name.trim().length > 0),
      })

      setSelectedClub(updated)
      setClubSaveMessage('Club profile updated successfully!')
      setTimeout(() => setClubSaveMessage(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update club profile.'
      setClubSaveError(msg)
    } finally {
      setIsSavingClub(false)
    }
  }

  // Handle Coordinator List editing
  const addCoordinatorRow = () => {
    setEditCoordinators([...editCoordinators, { name: '', branch: '', roll_no: '' }])
  }

  const updateCoordinatorRow = (index: number, field: keyof ClubCoordinator, value: string) => {
    const updated = [...editCoordinators]
    const current = updated[index] || { name: '' }
    updated[index] = { ...current, [field]: value, name: field === 'name' ? value : current.name }
    setEditCoordinators(updated)
  }

  const removeCoordinatorRow = (index: number) => {
    setEditCoordinators(editCoordinators.filter((_, i) => i !== index))
  }

  // Handle Reviewing Applications
  const handleReviewApplication = async (app: ClubApplication, status: 'approved' | 'rejected') => {
    if (!user || !selectedClub) return
    try {
      await organizerService.reviewApplication(
        app.id,
        status,
        user.id,
        selectedClub.id,
        app.applicant_id
      )
      await loadClubData()
    } catch (err) {
      console.error('Failed to review application:', err)
    }
  }

  // Handle Removing Member
  const handleConfirmRemoveMember = async () => {
    if (!selectedClub || !memberToRemove) return
    setIsRemovingMember(true)
    try {
      await organizerService.removeMember(selectedClub.id, memberToRemove.user_id)
      setMemberToRemove(null)
      await loadClubData()
    } catch (err) {
      console.error('Failed to remove member:', err)
    } finally {
      setIsRemovingMember(false)
    }
  }

  // Handle Announcements
  const handleOpenAnnouncementModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncementId(announcement.id)
      setAnnouncementTitle(announcement.title)
      setAnnouncementContent(announcement.content)
      setAnnouncementStatus(announcement.status === 'draft' ? 'draft' : 'published')
    } else {
      setEditingAnnouncementId(null)
      setAnnouncementTitle('')
      setAnnouncementContent('')
      setAnnouncementStatus('published')
    }
    setIsAnnouncementModalOpen(true)
  }

  const handleSaveAnnouncement = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClub || !announcementTitle.trim()) return

    setIsSavingAnnouncement(true)
    try {
      if (editingAnnouncementId) {
        await announcementService.updateAnnouncement(editingAnnouncementId, {
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          status: announcementStatus,
        })
      } else {
        await announcementService.createAnnouncement({
          clubId: selectedClub.id,
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          createdBy: user.id,
          status: announcementStatus,
        })
      }

      setIsAnnouncementModalOpen(false)
      await loadClubData()
    } catch (err) {
      console.error('Failed to save announcement:', err)
    } finally {
      setIsSavingAnnouncement(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await announcementService.deleteAnnouncement(id)
      await loadClubData()
    } catch (err) {
      console.error('Failed to delete announcement:', err)
    }
  }

  // Handle Events Modal
  const handleOpenEventModal = (event?: CampusEvent) => {
    if (event) {
      setEditingEventId(event.id)
      setEventTitle(event.title)
      setEventDescription(event.description)
      setEventType(event.event_type)
      setEventVenue(event.venue)
      setEventStartTime(new Date(event.start_time).toISOString().slice(0, 16))
      setEventEndTime(new Date(event.end_time).toISOString().slice(0, 16))
      setEventMaxCapacity(event.max_capacity ? String(event.max_capacity) : '')
      setEventTags(event.tags ? event.tags.join(', ') : '')
    } else {
      setEditingEventId(null)
      setEventTitle('')
      setEventDescription('')
      setEventType('workshop')
      setEventVenue('')
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const nextWeekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
      setEventStartTime(nextWeek.toISOString().slice(0, 16))
      setEventEndTime(nextWeekEnd.toISOString().slice(0, 16))
      setEventMaxCapacity('50')
      setEventTags('')
    }
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClub || !eventTitle.trim()) return

    setIsSavingEvent(true)
    try {
      const parsedTags = eventTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const capacityNum = eventMaxCapacity ? parseInt(eventMaxCapacity, 10) : null

      if (editingEventId) {
        await eventService.updateEvent(editingEventId, {
          title: eventTitle.trim(),
          description: eventDescription.trim(),
          category: selectedClub.category,
          eventType,
          venue: eventVenue.trim(),
          startTime: new Date(eventStartTime).toISOString(),
          endTime: new Date(eventEndTime).toISOString(),
          maxCapacity: capacityNum,
          tags: parsedTags,
        })
      } else {
        await eventService.createEvent({
          clubId: selectedClub.id,
          title: eventTitle.trim(),
          description: eventDescription.trim(),
          category: selectedClub.category,
          eventType,
          venue: eventVenue.trim(),
          startTime: new Date(eventStartTime).toISOString(),
          endTime: new Date(eventEndTime).toISOString(),
          maxCapacity: capacityNum,
          tags: parsedTags,
          createdBy: user.id,
        })
      }

      setIsEventModalOpen(false)
      await loadClubData()
    } catch (err) {
      console.error('Failed to save event:', err)
    } finally {
      setIsSavingEvent(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await eventService.deleteEvent(id)
      await loadClubData()
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  // Handle Managing Attendees
  const handleOpenAttendees = async (event: CampusEvent) => {
    setSelectedEventForAttendees(event)
    setIsLoadingAttendees(true)
    try {
      const data = await eventService.getEventAttendees(event.id)
      setAttendees(data)
    } catch (err) {
      console.error('Failed to load attendees:', err)
    } finally {
      setIsLoadingAttendees(false)
    }
  }

  const handleToggleAttendance = async (reg: EventRegistration) => {
    const newStatus = reg.status !== 'attended'
    try {
      await eventService.markAttendance(reg.id, newStatus)
      if (selectedEventForAttendees) {
        const data = await eventService.getEventAttendees(selectedEventForAttendees.id)
        setAttendees(data)
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err)
    }
  }

  // Handle Projects Modal
  const handleOpenProjectModal = (proj?: CampusProject) => {
    if (proj) {
      setEditingProjectId(proj.id)
      setProjectTitle(proj.title)
      setProjectDescription(proj.description)
      setProjectCategory(proj.category)
      setProjectStatus(proj.status)
      setProjectTechStack(proj.tech_stack ? proj.tech_stack.join(', ') : '')
      setProjectGithubUrl(proj.github_url || '')
      setProjectDemoUrl(proj.demo_url || '')
      setProjectOpenRoles(proj.open_roles || [])
    } else {
      setEditingProjectId(null)
      setProjectTitle('')
      setProjectDescription('')
      setProjectCategory(selectedClub?.category || 'Innovation & Projects')
      setProjectStatus('open')
      setProjectTechStack('')
      setProjectGithubUrl('')
      setProjectDemoUrl('')
      setProjectOpenRoles([
        { role: 'Developer Lead', slots: 1, filled: 0, skills: ['React', 'TypeScript'] },
      ])
    }
    setIsProjectModalOpen(true)
  }

  const handleAddProjectRoleRow = () => {
    setProjectOpenRoles([
      ...projectOpenRoles,
      { role: '', slots: 1, filled: 0, skills: [] },
    ])
  }

  const handleUpdateProjectRole = (
    index: number,
    field: keyof ProjectRole,
    value: unknown
  ) => {
    const updated = [...projectOpenRoles]
    const current = updated[index] || { role: '', slots: 1, filled: 0, skills: [] }
    updated[index] = { ...current, [field]: value }
    setProjectOpenRoles(updated)
  }

  const handleRemoveProjectRoleRow = (index: number) => {
    setProjectOpenRoles(projectOpenRoles.filter((_, i) => i !== index))
  }

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClub || !projectTitle.trim()) return

    setIsSavingProject(true)
    try {
      const parsedTech = projectTechStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const validRoles = projectOpenRoles.filter((r) => r.role.trim().length > 0)

      if (editingProjectId) {
        await projectService.updateProject(editingProjectId, {
          title: projectTitle.trim(),
          description: projectDescription.trim(),
          category: projectCategory,
          status: projectStatus,
          openRoles: validRoles,
          techStack: parsedTech,
          githubUrl: projectGithubUrl.trim() || null,
          demoUrl: projectDemoUrl.trim() || null,
        })
      } else {
        await projectService.createProject({
          clubId: selectedClub.id,
          title: projectTitle.trim(),
          description: projectDescription.trim(),
          category: projectCategory,
          status: projectStatus,
          openRoles: validRoles,
          techStack: parsedTech,
          githubUrl: projectGithubUrl.trim() || null,
          demoUrl: projectDemoUrl.trim() || null,
          createdBy: user.id,
        })
      }

      setIsProjectModalOpen(false)
      await loadClubData()
    } catch (err) {
      console.error('Failed to save project:', err)
    } finally {
      setIsSavingProject(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await projectService.deleteProject(id)
      await loadClubData()
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  // Handle Project Applicants
  const handleOpenApplicants = async (proj: CampusProject) => {
    setSelectedProjectForApplicants(proj)
    setIsLoadingApplicants(true)
    try {
      const data = await projectService.getProjectApplications(proj.id)
      setProjectApplicants(data)
    } catch (err) {
      console.error('Failed to load project applicants:', err)
    } finally {
      setIsLoadingApplicants(false)
    }
  }

  const handleReviewProjectApplicant = async (
    appId: string,
    status: 'approved' | 'rejected'
  ) => {
    if (!user) return
    try {
      await projectService.reviewProjectApplication(
        appId,
        status,
        status === 'approved' ? 'Welcome to the project team!' : 'Positions filled.',
        user.id
      )
      if (selectedProjectForApplicants) {
        const data = await projectService.getProjectApplications(selectedProjectForApplicants.id)
        setProjectApplicants(data)
      }
    } catch (err) {
      console.error('Failed to review applicant:', err)
    }
  }

  // Handle Collaboration Modal
  const handleOpenCollabModal = () => {
    const defaultTarget = allCampusClubs.find((c) => c.id !== selectedClub?.id)
    setCollabTargetClubId(defaultTarget?.id || '')
    setCollabTitle('')
    setCollabDescription('')
    setCollabDates('')
    setCollabNotes('')
    setCollabError(null)
    setIsCollabModalOpen(true)
  }

  const handleSaveCollabProposal = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClub || !collabTargetClubId || !collabTitle.trim()) return

    setIsSavingCollab(true)
    setCollabError(null)

    try {
      await collaborationService.createCollaborationProposal({
        initiatorClubId: selectedClub.id,
        targetClubId: collabTargetClubId,
        title: collabTitle.trim(),
        description: collabDescription.trim(),
        proposedDates: collabDates.trim() || null,
        initiatorNotes: collabNotes.trim() || null,
        createdBy: user.id,
      })

      setIsCollabModalOpen(false)
      await loadClubData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit proposal.'
      setCollabError(msg)
    } finally {
      setIsSavingCollab(false)
    }
  }

  // Handle Proposal Response (Accept / Reject)
  const handleOpenResponseModal = (collab: ClubCollaboration, action: 'accepted' | 'rejected') => {
    setCollabToRespond({ collab, action })
    setCollabResponseNote('')
  }

  const handleSubmitResponse = async (e: FormEvent) => {
    e.preventDefault()
    if (!collabToRespond) return

    setIsRespondingCollab(true)
    try {
      await collaborationService.respondToProposal(
        collabToRespond.collab.id,
        collabToRespond.action,
        collabResponseNote.trim() || undefined
      )
      setCollabToRespond(null)
      await loadClubData()
    } catch (err) {
      console.error('Failed to respond to proposal:', err)
    } finally {
      setIsRespondingCollab(false)
    }
  }

  // Split collaborations into incoming, outgoing, and active
  const incomingProposals = collaborations.filter(
    (c) => c.target_club_id === selectedClub?.id && c.status === 'pending'
  )
  const outgoingProposals = collaborations.filter(
    (c) => c.initiator_club_id === selectedClub?.id && c.status === 'pending'
  )
  const activeCollaborations = collaborations.filter((c) =>
    ['accepted', 'completed'].includes(c.status)
  )

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Club Organizer Workspace..." />
      </div>
    )
  }

  const organizerName = profile?.full_name || 'Club Organizer'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Workspace Header */}
      <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05326]/20 border border-[#E05326]/40 text-[#E05326] text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Coordinator Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Welcome, {organizerName}</h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Centralized control center to manage club information, events, projects,
            collaborations, members, join applications, and announcements.
          </p>
        </div>

        {/* Club Switcher */}
        {clubs.length > 0 && (
          <div className="w-full md:w-auto bg-[#241F1A] p-3.5 rounded-2xl border border-stone-700 space-y-1.5 relative z-10 shadow-xs">
            <label htmlFor="club-switcher" className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
              Managing Society:
            </label>
            <select
              id="club-switcher"
              value={selectedClub?.id || ''}
              onChange={(e) => {
                const found = clubs.find((c) => c.id === e.target.value)
                if (found) setSelectedClub(found)
              }}
              className="w-full md:w-60 px-3.5 py-2 rounded-xl bg-[#181512] text-[#F9F6F0] border border-stone-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E05326] cursor-pointer"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#E5DFD5]">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'events', label: `Events (${events.length})`, icon: Calendar },
            { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
            {
              id: 'collaborations',
              label: `Collaborations (${collaborations.length})`,
              icon: Handshake,
            },
            { id: 'edit-club', label: 'Club Profile', icon: Edit },
            { id: 'members', label: `Members (${stats.totalMembers})`, icon: Users },
            { id: 'requests', label: `Join Requests (${stats.pendingApplications})`, icon: Clock },
            {
              id: 'announcements',
              label: `Announcements (${announcements.length})`,
              icon: Megaphone,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
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

      {isTabLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="md" label="Loading club data..." />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="editorial-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                      Active Members
                    </p>
                    <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                      <Users className="h-4 w-4 text-[#E05326]" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-stone-900">{stats.totalMembers}</p>
                  <p className="mt-1 text-[11px] text-stone-500 font-mono">Registered students</p>
                </div>

                <div className="editorial-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                      Projects
                    </p>
                    <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                      <FolderGit2 className="h-4 w-4 text-[#E05326]" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-stone-900">{projects.length}</p>
                  <p className="mt-1 text-[11px] text-stone-500 font-mono">Recruiting roles</p>
                </div>

                <div className="editorial-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                      Events
                    </p>
                    <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                      <Calendar className="h-4 w-4 text-[#E05326]" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-stone-900">{events.length}</p>
                  <p className="mt-1 text-[11px] text-stone-500 font-mono">Campus workshops</p>
                </div>

                <div className="editorial-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                      Joint Collabs
                    </p>
                    <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                      <Handshake className="h-4 w-4 text-[#E05326]" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-stone-900">{collaborations.length}</p>
                  <p className="mt-1 text-[11px] text-stone-500 font-mono">Partner initiatives</p>
                </div>

                <div className="editorial-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                      Join Requests
                    </p>
                    <div className="h-8 w-8 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
                      <Clock className="h-4 w-4 text-[#E05326]" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#E05326]">
                    {stats.pendingApplications}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-500 font-mono">Pending review</p>
                </div>
              </div>

              {/* Quick Actions & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                    </CardHeader>
                    <CardBody className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="justify-start text-xs h-auto py-3 px-4"
                        onClick={() => handleOpenProjectModal()}
                        leftIcon={<Plus className="h-4 w-4 text-emerald-600" />}
                      >
                        New Project
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start text-xs h-auto py-3 px-4"
                        onClick={() => handleOpenEventModal()}
                        leftIcon={<Plus className="h-4 w-4 text-primary" />}
                      >
                        Create Event
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start text-xs h-auto py-3 px-4"
                        onClick={() => handleOpenCollabModal()}
                        leftIcon={<Handshake className="h-4 w-4 text-indigo-600" />}
                      >
                        Propose Collab
                      </Button>
                    </CardBody>
                  </Card>

                  {/* Public Club Preview Banner */}
                  <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedClub?.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        View this club as students see it on the directory.
                      </p>
                    </div>
                    {selectedClub && (
                      <Link to={`/clubs/${selectedClub.slug}`}>
                        <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                          View Public Page
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right: Leadership Roster */}
                <div className="space-y-6">
                  <Card className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <School className="h-4 w-4 text-primary" /> Faculty In-Charge
                    </h3>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedClub?.faculty_incharge || 'Not assigned'}
                    </p>

                    <div className="border-t border-gray-100 pt-3">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                        <GraduationCap className="h-4 w-4 text-secondary" /> Student Coordinators
                      </h3>
                      <div className="space-y-2">
                        {selectedClub?.coordinators && selectedClub.coordinators.length > 0 ? (
                          selectedClub.coordinators.map((c, i) => (
                            <div key={i} className="text-xs">
                              <p className="font-semibold text-gray-800">{c.name}</p>
                              <p className="text-gray-500">{c.branch}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">No coordinators listed</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS MANAGER */}
          {activeTab === 'events' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Club Events & Workshops ({events.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Manage hackathons, technical sessions, and attendee check-in.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenEventModal()}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create Event
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                {events.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="h-10 w-10 text-gray-400" />}
                    title="No events scheduled"
                    description="Create your first club workshop or competition to start accepting student registrations."
                    action={
                      <Button size="sm" onClick={() => handleOpenEventModal()}>
                        Create Event
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">{ev.title}</h3>
                            <Badge variant="primary" className="text-[11px] uppercase">
                              {ev.event_type}
                            </Badge>
                            <Badge
                              variant={ev.status === 'published' ? 'success' : 'default'}
                              className="text-[11px]"
                            >
                              {ev.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {formatDate(ev.start_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-secondary" />
                              {ev.venue}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              <Users className="h-3.5 w-3.5 text-emerald-600" />
                              {ev.registration_count || 0}{' '}
                              {ev.max_capacity ? `/ ${ev.max_capacity}` : ''} Registered
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleOpenAttendees(ev)}
                            leftIcon={<UserCheck className="h-3.5 w-3.5 text-primary" />}
                          >
                            Attendees
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleOpenEventModal(ev)}
                            className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
                            title="Edit Event"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-2 text-gray-400 hover:text-error rounded-lg hover:bg-red-50"
                            title="Delete Event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* TAB 3: PROJECTS MANAGER */}
          {activeTab === 'projects' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Campus Development Projects ({projects.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Post open initiatives, define role requirements, and screen student applicants.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenProjectModal()}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Project
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={<FolderGit2 className="h-10 w-10 text-gray-400" />}
                    title="No projects posted yet"
                    description="Create a technical or creative project to recruit student developers and designers."
                    action={
                      <Button size="sm" onClick={() => handleOpenProjectModal()}>
                        Create Project
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-gray-900">{proj.title}</h3>
                            <Badge variant="primary" className="text-[11px]">
                              {proj.category}
                            </Badge>
                            <Badge
                              variant={proj.status === 'open' ? 'success' : 'default'}
                              className="text-[11px] uppercase"
                            >
                              {proj.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{proj.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Briefcase className="h-3 w-3" />
                              {proj.open_roles?.length || 0} Positions Listed
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-primary" />
                              {proj.application_count || 0} Applicants
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleOpenApplicants(proj)}
                            leftIcon={<Users className="h-3.5 w-3.5 text-primary" />}
                          >
                            Applicants ({proj.application_count || 0})
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleOpenProjectModal(proj)}
                            className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
                            title="Edit Project"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-2 text-gray-400 hover:text-error rounded-lg hover:bg-red-50"
                            title="Delete Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* TAB 4: COLLABORATIONS MANAGER */}
          {activeTab === 'collaborations' && (
            <div className="space-y-8">
              {/* Header and CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Inter-Society Collaborations ({collaborations.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Partner with other UIET societies on co-hosted bootcamps, hackathons, and
                    initiatives.
                  </p>
                </div>
                <Button
                  onClick={handleOpenCollabModal}
                  leftIcon={<Handshake className="h-4 w-4" />}
                >
                  Propose Joint Initiative
                </Button>
              </div>

              {/* Incoming Proposals Queue */}
              <Card>
                <CardHeader className="flex items-center justify-between bg-amber-50/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Incoming Proposals ({incomingProposals.length})
                    </h3>
                  </div>
                  <Badge variant="warning">{incomingProposals.length} Pending Action</Badge>
                </CardHeader>
                <CardBody className="p-0">
                  {incomingProposals.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No incoming proposals waiting for your review.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {incomingProposals.map((collab) => (
                        <div
                          key={collab.id}
                          className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="primary" className="text-xs">
                                From {collab.initiator_club?.name}
                              </Badge>
                              <h4 className="text-base font-bold text-gray-900">{collab.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 whitespace-pre-line">
                              {collab.description}
                            </p>
                            {collab.proposed_dates && (
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-primary" />
                                <span>Proposed Timeline: {collab.proposed_dates}</span>
                              </p>
                            )}
                            {collab.initiator_notes && (
                              <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                <strong>Partner Note:</strong> &ldquo;{collab.initiator_notes}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-error hover:bg-red-50 border-red-200"
                              onClick={() => handleOpenResponseModal(collab, 'rejected')}
                              leftIcon={<X className="h-3.5 w-3.5" />}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => handleOpenResponseModal(collab, 'accepted')}
                              leftIcon={<Check className="h-3.5 w-3.5" />}
                            >
                              Accept Proposal
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Active & Co-Hosted Initiatives */}
              <Card>
                <CardHeader className="flex items-center justify-between bg-emerald-50/40">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Active & Completed Initiatives ({activeCollaborations.length})
                    </h3>
                  </div>
                  <Badge variant="success">{activeCollaborations.length} Active</Badge>
                </CardHeader>
                <CardBody className="p-0">
                  {activeCollaborations.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No active cross-club initiatives. Propose a joint project to get started!
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {activeCollaborations.map((collab) => (
                        <div
                          key={collab.id}
                          className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="success" className="text-xs uppercase">
                                {collab.status}
                              </Badge>
                              <h4 className="text-base font-bold text-gray-900">{collab.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600">{collab.description}</p>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
                              <span className="font-semibold text-primary">
                                Partner: {collab.target_club?.name} &amp;{' '}
                                {collab.initiator_club?.name}
                              </span>
                              {collab.proposed_dates && (
                                <span>&bull; {collab.proposed_dates}</span>
                              )}
                            </div>
                            {collab.target_response && (
                              <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 mt-1">
                                <strong>Feedback:</strong> {collab.target_response}
                              </p>
                            )}
                          </div>

                          {collab.status === 'accepted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-emerald-700 hover:bg-emerald-50 shrink-0"
                              onClick={() => {
                                collaborationService
                                  .completeCollaboration(collab.id)
                                  .then(() => loadClubData())
                              }}
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            >
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Outgoing Proposals */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    Outgoing Proposals ({outgoingProposals.length})
                  </h3>
                  <Badge variant="default">{outgoingProposals.length} Sent</Badge>
                </CardHeader>
                <CardBody className="p-0">
                  {outgoingProposals.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No pending outgoing proposals.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {outgoingProposals.map((collab) => (
                        <div
                          key={collab.id}
                          className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                Sent to {collab.target_club?.name}
                              </Badge>
                              <h4 className="text-sm font-bold text-gray-900">{collab.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500">{collab.description}</p>
                          </div>
                          <Badge variant="warning" className="text-xs shrink-0">
                            Awaiting Response
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {/* TAB 5: CLUB PROFILE EDITOR */}
          {activeTab === 'edit-club' && (
            <Card>
              <CardHeader>
                <h2 className="text-base font-bold text-gray-900">
                  Edit Club Profile — {selectedClub?.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update the public description, objectives, activities, and coordinator roster.
                </p>
              </CardHeader>
              <CardBody className="p-6">
                {clubSaveMessage && (
                  <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{clubSaveMessage}</span>
                  </div>
                )}
                {clubSaveError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-sm text-error">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{clubSaveError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveClubProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-primary" /> Club Objective
                    </label>
                    <textarea
                      rows={3}
                      value={editObjective}
                      onChange={(e) => setEditObjective(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-secondary" /> Roles & Core Activities
                    </label>
                    <textarea
                      rows={4}
                      value={editActivities}
                      onChange={(e) => setEditActivities(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Input
                      label="Faculty In-Charge Name"
                      type="text"
                      value={editFaculty}
                      onChange={(e) => setEditFaculty(e.target.value)}
                    />
                  </div>

                  {/* Dynamic Coordinators Editor */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Student Coordinators Roster
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCoordinatorRow}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                      >
                        Add Coordinator
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {editCoordinators.map((coord, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={coord.name}
                            onChange={(e) =>
                              updateCoordinatorRow(index, 'name', e.target.value)
                            }
                            className="w-full sm:flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Branch / Semester (e.g. B.Tech CSE 7th Sem)"
                            value={coord.branch || ''}
                            onChange={(e) =>
                              updateCoordinatorRow(index, 'branch', e.target.value)
                            }
                            className="w-full sm:flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Roll No (Optional)"
                            value={coord.roll_no || ''}
                            onChange={(e) =>
                              updateCoordinatorRow(index, 'roll_no', e.target.value)
                            }
                            className="w-full sm:w-32 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeCoordinatorRow(index)}
                            className="p-1.5 text-gray-400 hover:text-error rounded-lg hover:bg-gray-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isSavingClub}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Save Club Profile
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* TAB 6: MEMBER DIRECTORY */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Club Members Directory</h2>
                  <p className="text-xs text-gray-500">
                    Active students registered in {selectedClub?.name}.
                  </p>
                </div>
                <Badge variant="primary">{members.length} Members</Badge>
              </CardHeader>
              <CardBody className="p-0">
                {members.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-10 w-10 text-gray-400" />}
                    title="No members yet"
                    description="Students who join this club from the campus directory will be listed here."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3">Student</th>
                          <th className="px-6 py-3">Department</th>
                          <th className="px-6 py-3">Semester</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">Joined Date</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {members.map((m) => {
                          const name = m.profile?.full_name || 'Student'
                          const initials = getInitials(name)
                          return (
                            <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                                    {name}
                                  </p>
                                  <p className="text-xs text-gray-400">{m.profile?.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-gray-700">
                                {m.profile?.department || 'General'}
                              </td>
                              <td className="px-6 py-4 text-xs">
                                {m.profile?.semester || '1st Semester'}
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant={
                                    m.membership_role === 'coordinator' ? 'primary' : 'default'
                                  }
                                  className="text-xs"
                                >
                                  {m.membership_role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-400">
                                {formatDate(m.joined_at)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-gray-400 hover:text-error"
                                  onClick={() => setMemberToRemove(m)}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* TAB 7: JOIN REQUESTS */}
          {activeTab === 'requests' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Membership Applications</h2>
                  <p className="text-xs text-gray-500">
                    Review and approve students requesting to join {selectedClub?.name}.
                  </p>
                </div>
                <Badge variant="warning">{stats.pendingApplications} Pending</Badge>
              </CardHeader>
              <CardBody className="p-0">
                {applications.length === 0 ? (
                  <EmptyState
                    icon={<Clock className="h-10 w-10 text-gray-400" />}
                    title="No applications in queue"
                    description="When students submit structured membership requests, they will appear here for review."
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">
                              {app.applicant?.full_name || 'Applicant'}
                            </p>
                            <Badge
                              variant={
                                app.status === 'approved'
                                  ? 'success'
                                  : app.status === 'rejected'
                                    ? 'error'
                                    : 'warning'
                              }
                              className="text-xs"
                            >
                              {app.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {app.applicant?.department} &bull; {app.applicant?.semester} &bull;{' '}
                            {formatDate(app.created_at)}
                          </p>
                          {app.message && (
                            <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-2 max-w-xl">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          )}
                        </div>

                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-error hover:bg-red-50 border-red-200"
                              onClick={() => handleReviewApplication(app, 'rejected')}
                              leftIcon={<X className="h-3.5 w-3.5" />}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => handleReviewApplication(app, 'approved')}
                              leftIcon={<Check className="h-3.5 w-3.5" />}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* TAB 8: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Club Announcements</h2>
                  <p className="text-xs text-gray-500">
                    Publish official updates and notices to club members and the campus.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenAnnouncementModal()}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Announcement
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                {announcements.length === 0 ? (
                  <EmptyState
                    icon={<Megaphone className="h-10 w-10 text-gray-400" />}
                    title="No announcements yet"
                    description="Create your first club announcement to notify students about upcoming sessions, schedules, or workshops."
                    action={
                      <Button size="sm" onClick={() => handleOpenAnnouncementModal()}>
                        Create Announcement
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">{ann.title}</h3>
                            <Badge
                              variant={ann.status === 'published' ? 'success' : 'default'}
                              className="text-[11px]"
                            >
                              {ann.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-2">
                            {ann.content}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-2 pt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(ann.published_at)}</span>
                            {ann.author && (
                              <span>&bull; Posted by {ann.author.full_name}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenAnnouncementModal(ann)}
                            className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-2 text-gray-400 hover:text-error rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Create/Edit Project Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title={editingProjectId ? 'Edit Campus Project' : 'Post New Campus Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <Input
            label="Project Title"
            type="text"
            placeholder="e.g. UIET Autonomous Rover & SLAM Navigation"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="AI & Data Science">AI &amp; Data Science</option>
                <option value="DSA & Coding">DSA &amp; Coding</option>
                <option value="Design & Digital Content">Design &amp; Digital Content</option>
                <option value="Innovation & Projects">Innovation &amp; Projects</option>
                <option value="Web & Cloud">Web &amp; Cloud</option>
                <option value="Hardware & IoT">Hardware &amp; IoT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recruitment Status</label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="open">Open (Accepting Applications)</option>
                <option value="active">Active (Team Assembled)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Description &amp; Vision
            </label>
            <textarea
              rows={4}
              placeholder="Describe the project goal, scope, architecture, and expected deliverables..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <Input
            label="Tech Stack (Comma separated)"
            type="text"
            placeholder="Python, ROS2, C++, OpenCV, Arduino"
            value={projectTechStack}
            onChange={(e) => setProjectTechStack(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL (Optional)"
              type="text"
              placeholder="https://github.com/club/repo"
              value={projectGithubUrl}
              onChange={(e) => setProjectGithubUrl(e.target.value)}
            />
            <Input
              label="Demo / Live Link (Optional)"
              type="text"
              placeholder="https://project.uiet.mdu.ac.in"
              value={projectDemoUrl}
              onChange={(e) => setProjectDemoUrl(e.target.value)}
            />
          </div>

          {/* Open Roles Builder */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Open Role Openings ({projectOpenRoles.length})
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProjectRoleRow}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Add Role
              </Button>
            </div>

            <div className="space-y-3">
              {projectOpenRoles.map((role, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Role Title (e.g. ROS2 Embedded Dev)"
                    value={role.role}
                    onChange={(e) => handleUpdateProjectRole(rIdx, 'role', e.target.value)}
                    className="w-full sm:flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    required
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Slots:</span>
                    <input
                      type="number"
                      min="1"
                      value={role.slots}
                      onChange={(e) =>
                        handleUpdateProjectRole(rIdx, 'slots', parseInt(e.target.value, 10) || 1)
                      }
                      className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProjectRoleRow(rIdx)}
                    className="p-1.5 text-gray-400 hover:text-error rounded-lg hover:bg-gray-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProjectModalOpen(false)}
              disabled={isSavingProject}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingProject}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {editingProjectId ? 'Update Project' : 'Publish Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Applicants Modal */}
      <Modal
        isOpen={Boolean(selectedProjectForApplicants)}
        onClose={() => setSelectedProjectForApplicants(null)}
        title={`Applicants — ${selectedProjectForApplicants?.title || 'Project'}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
            <span>
              Total Submissions:{' '}
              <strong className="text-gray-900">{projectApplicants.length}</strong>
            </span>
            <span>
              Approved:{' '}
              <strong className="text-success">
                {projectApplicants.filter((a) => a.status === 'approved').length}
              </strong>
            </span>
          </div>

          {isLoadingApplicants ? (
            <div className="py-8 text-center">
              <LoadingSpinner size="sm" label="Loading applicants..." />
            </div>
          ) : projectApplicants.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              No students have applied for positions on this project yet.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {projectApplicants.map((app) => {
                const name = app.applicant?.full_name || 'Student'
                const initials = getInitials(name)
                return (
                  <div key={app.id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{name}</p>
                          <p className="text-[11px] text-gray-400">
                            {app.applicant?.department} &bull; {app.applicant?.semester}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            app.status === 'approved'
                              ? 'success'
                              : app.status === 'rejected'
                                ? 'error'
                                : 'warning'
                          }
                          className="text-[10px] uppercase"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p>
                        <strong className="text-gray-900">Role Applied:</strong> {app.role_applied}
                      </p>
                      {app.skills_summary && (
                        <p>
                          <strong className="text-gray-900">Skills:</strong> {app.skills_summary}
                        </p>
                      )}
                      <p className="text-gray-700 whitespace-pre-line">
                        <strong className="text-gray-900">Statement:</strong> &ldquo;
                        {app.statement_of_interest}&rdquo;
                      </p>
                      {app.portfolio_links && (
                        <p className="pt-1">
                          <strong className="text-gray-900">Links:</strong>{' '}
                          <a
                            href={app.portfolio_links}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            {app.portfolio_links}
                          </a>
                        </p>
                      )}
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-error hover:bg-red-50 border-red-200"
                          onClick={() => handleReviewProjectApplicant(app.id, 'rejected')}
                          leftIcon={<X className="h-3.5 w-3.5" />}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => handleReviewProjectApplicant(app.id, 'approved')}
                          leftIcon={<Check className="h-3.5 w-3.5" />}
                        >
                          Approve Contributor
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Propose Collaboration Modal */}
      <Modal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        title="Propose Joint Cross-Club Initiative"
      >
        <form onSubmit={handleSaveCollabProposal} className="space-y-4">
          {collabError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-error">
              {collabError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Partner Club
            </label>
            <select
              value={collabTargetClubId}
              onChange={(e) => setCollabTargetClubId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {allCampusClubs
                .filter((c) => c.id !== selectedClub?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Initiative / Event Title"
            type="text"
            placeholder="e.g. AI in Modern Tech Careers: Joint Workshop"
            value={collabTitle}
            onChange={(e) => setCollabTitle(e.target.value)}
            required
          />

          <Input
            label="Proposed Dates / Timeline"
            type="text"
            placeholder="e.g. 3rd Week of next month / 2-Day Weekend Sprint"
            value={collabDates}
            onChange={(e) => setCollabDates(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Initiative Description & Roles Breakdown
            </label>
            <textarea
              rows={4}
              placeholder="Outline the vision, joint objectives, each club's responsibilities, and target audience..."
              value={collabDescription}
              onChange={(e) => setCollabDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <Input
            label="Proposal Note to Coordinators (Optional)"
            type="text"
            placeholder="e.g. Looking forward to discussing this at the upcoming inter-club meeting!"
            value={collabNotes}
            onChange={(e) => setCollabNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCollabModalOpen(false)}
              disabled={isSavingCollab}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingCollab}
              leftIcon={<Handshake className="h-4 w-4" />}
            >
              Send Proposal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Response to Collaboration Modal */}
      <Modal
        isOpen={Boolean(collabToRespond)}
        onClose={() => setCollabToRespond(null)}
        title={
          collabToRespond?.action === 'accepted'
            ? 'Accept Collaboration Proposal'
            : 'Decline Collaboration Proposal'
        }
      >
        <form onSubmit={handleSubmitResponse} className="space-y-4">
          <p className="text-sm text-gray-600">
            {collabToRespond?.action === 'accepted' ? (
              <>
                You are accepting the proposal for{' '}
                <strong className="text-gray-900">{collabToRespond?.collab.title}</strong> from{' '}
                <strong className="text-gray-900">
                  {collabToRespond?.collab.initiator_club?.name}
                </strong>
                .
              </>
            ) : (
              <>
                You are declining the proposal for{' '}
                <strong className="text-gray-900">{collabToRespond?.collab.title}</strong>.
              </>
            )}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Response Feedback / Note to Partner Club
            </label>
            <textarea
              rows={3}
              placeholder={
                collabToRespond?.action === 'accepted'
                  ? 'We are delighted to co-host! Let us schedule a planning sync.'
                  : 'Thank you for the proposal. Due to conflicting schedules this month, we cannot commit.'
              }
              value={collabResponseNote}
              onChange={(e) => setCollabResponseNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCollabToRespond(null)}
              disabled={isRespondingCollab}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={collabToRespond?.action === 'accepted' ? 'primary' : 'destructive'}
              isLoading={isRespondingCollab}
            >
              {collabToRespond?.action === 'accepted' ? 'Confirm & Accept' : 'Confirm & Decline'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create/Edit Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEventId ? 'Edit Club Event' : 'Create New Club Event'}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <Input
            label="Event Title"
            type="text"
            placeholder="e.g. Next-Gen FullStack Web Bootcamp"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Format</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="workshop">Workshop (Hands-on)</option>
                <option value="hackathon">Hackathon</option>
                <option value="seminar">Seminar / Guest Talk</option>
                <option value="competition">Competition</option>
                <option value="webinar">Webinar (Online)</option>
                <option value="general">General Session</option>
              </select>
            </div>

            <Input
              label="Maximum Seating Capacity"
              type="number"
              placeholder="e.g. 60 (leave empty for unlimited)"
              value={eventMaxCapacity}
              onChange={(e) => setEventMaxCapacity(e.target.value)}
            />
          </div>

          <Input
            label="Venue / Location"
            type="text"
            placeholder="e.g. UIET Lab 3, CSE Block or Online Link"
            value={eventVenue}
            onChange={(e) => setEventVenue(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
              required
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              value={eventEndTime}
              onChange={(e) => setEventEndTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Event Description & Agenda
            </label>
            <textarea
              rows={4}
              placeholder="Describe the topics covered, prerequisites, what to bring, and schedule..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <Input
            label="Tags (Comma separated)"
            type="text"
            placeholder="AI, Python, PyTorch, Deep Learning"
            value={eventTags}
            onChange={(e) => setEventTags(e.target.value)}
          />

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEventModalOpen(false)}
              disabled={isSavingEvent}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingEvent}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {editingEventId ? 'Update Event' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attendees Management Modal */}
      <Modal
        isOpen={Boolean(selectedEventForAttendees)}
        onClose={() => setSelectedEventForAttendees(null)}
        title={`Attendees — ${selectedEventForAttendees?.title || 'Event'}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
            <span>
              Total Registered: <strong className="text-gray-900">{attendees.length}</strong>
            </span>
            <span>
              Checked In:{' '}
              <strong className="text-success">
                {attendees.filter((a) => a.status === 'attended').length}
              </strong>
            </span>
          </div>

          {isLoadingAttendees ? (
            <div className="py-8 text-center">
              <LoadingSpinner size="sm" label="Loading attendees..." />
            </div>
          ) : attendees.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              No students have registered for this event yet.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {attendees.map((reg) => {
                const isAttended = reg.status === 'attended'
                const initials = getInitials(reg.profile?.full_name || 'Student')
                return (
                  <div key={reg.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {reg.profile?.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {reg.profile?.department} &bull; {reg.profile?.semester}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAttended ? 'primary' : 'outline'}
                      className="text-xs px-2.5 py-1 shrink-0"
                      onClick={() => handleToggleAttendance(reg)}
                      leftIcon={isAttended ? <Check className="h-3 w-3" /> : undefined}
                    >
                      {isAttended ? 'Checked In' : 'Check In'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* New/Edit Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={editingAnnouncementId ? 'Edit Announcement' : 'New Club Announcement'}
      >
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <Input
            label="Announcement Title"
            type="text"
            placeholder="e.g. AI Club 2026 Orientation & Workshop Schedule"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notice Content</label>
            <textarea
              rows={5}
              placeholder="Write the announcement details, timing, venue, or online meeting links..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={announcementStatus}
              onChange={(e) => setAnnouncementStatus(e.target.value as 'published' | 'draft')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="published">Published (Visible to all students)</option>
              <option value="draft">Draft (Private to coordinators)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAnnouncementModalOpen(false)}
              disabled={isSavingAnnouncement}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingAnnouncement}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {editingAnnouncementId ? 'Update Notice' : 'Publish Notice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member Confirmation"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemovingMember}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isRemovingMember}
              onClick={handleConfirmRemoveMember}
              leftIcon={<UserX className="h-4 w-4" />}
            >
              Confirm Removal
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove{' '}
          <strong className="text-gray-900">
            {memberToRemove?.profile?.full_name || 'this student'}
          </strong>{' '}
          from <strong className="text-gray-900">{selectedClub?.name}</strong>?
        </p>
      </Modal>
    </div>
  )
}
