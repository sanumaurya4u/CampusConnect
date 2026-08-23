import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Code2,
  Sparkles,
  ArrowLeft,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Award,
  Send,
  Briefcase,
  Users,
} from 'lucide-react'
import { projectService } from '@/services/project.service'
import { useAuth } from '@/features/auth'
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Input,
  LoadingSpinner,
} from '@/components/ui'
import { getInitials } from '@/lib/utils'
import type { CampusProject, ProjectRole, ProjectApplication } from '@/types'
import { useDocumentTitle } from '@/hooks'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState<CampusProject | null>(null)
  useDocumentTitle(project?.title ? `${project.title} — Project` : 'Project Details')
  const [userApplications, setUserApplications] = useState<ProjectApplication[]>([])
  const [contributors, setContributors] = useState<ProjectApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Application Modal state
  const [selectedRoleForApply, setSelectedRoleForApply] = useState<ProjectRole | null>(null)
  const [skillsSummary, setSkillsSummary] = useState('')
  const [statementOfInterest, setStatementOfInterest] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)

  const loadProjectData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const [projectData, contribData] = await Promise.all([
        projectService.getProjectById(id),
        projectService.getProjectContributors(id),
      ])
      setProject(projectData)
      setContributors(contribData)

      if (user?.id) {
        const apps = await projectService.getUserProjectApplications(user.id)
        setUserApplications(apps.filter((a) => a.project_id === id))
      }
    } catch (err) {
      console.error('Failed to load project details:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  const handleOpenApplyModal = (role: ProjectRole) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/projects/${id}` } } })
      return
    }
    setSelectedRoleForApply(role)
    setSkillsSummary('')
    setStatementOfInterest('')
    setPortfolioLinks('')
    setApplyError(null)
  }

  const handleSubmitApplication = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !project || !selectedRoleForApply || !statementOfInterest.trim()) return

    setIsApplying(true)
    setApplyError(null)

    try {
      const app = await projectService.applyToProject({
        projectId: project.id,
        applicantId: user.id,
        roleApplied: selectedRoleForApply.role,
        skillsSummary: skillsSummary.trim() || undefined,
        statementOfInterest: statementOfInterest.trim(),
        portfolioLinks: portfolioLinks.trim() || undefined,
      })

      setUserApplications((prev) => [...prev, app])
      setSelectedRoleForApply(null)
      setApplySuccess(
        `Application submitted successfully for "${selectedRoleForApply.role}"! The coordinators will review your profile.`
      )
      setTimeout(() => setApplySuccess(null), 6000)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to submit application. Please try again.'
      setApplyError(msg)
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading project details..." />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
        <p className="text-gray-600 text-sm">
          The project you are looking for does not exist or has been removed.
        </p>
        <Link to="/projects">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Projects Hub
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects Hub</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="text-xs">
                {project.category}
              </Badge>
              <Badge
                variant={project.status === 'open' ? 'success' : 'default'}
                className="text-xs uppercase font-bold"
              >
                {project.status === 'open' ? 'Recruiting' : project.status}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {project.title}
            </h1>

            {project.club && (
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Organized &amp; Led by</span>
                <Link
                  to={`/clubs/${project.club.slug}`}
                  className="font-bold text-primary hover:underline"
                >
                  {project.club.name}
                </Link>
              </p>
            )}
          </div>

          {/* External Links (GitHub / Demo) */}
          <div className="flex items-center gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                <span>GitHub Repository</span>
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Application Success Feedback */}
        {applySuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{applySuccess}</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description, Roles, Tech Stack */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-gray-900">About This Initiative</h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>

              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-primary" /> Tech Stack &amp; Tools
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-mono font-medium border border-gray-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Open Role Openings */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-gray-900">
                  Open Positions &amp; Recruitment ({project.open_roles.length})
                </h2>
              </div>
              <Badge variant="primary">Student Call</Badge>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-gray-100">
              {project.open_roles.map((role, idx) => {
                const openSlots = Math.max(0, role.slots - role.filled)
                const existingApp = userApplications.find((a) => a.role_applied === role.role)

                return (
                  <div
                    key={idx}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{role.role}</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {openSlots} Slot{openSlots !== 1 ? 's' : ''} Available
                        </span>
                      </div>

                      {role.skills && role.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {role.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] bg-indigo-50/80 text-primary px-2 py-0.5 rounded border border-indigo-100 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {existingApp ? (
                        <Badge
                          variant={
                            existingApp.status === 'approved'
                              ? 'success'
                              : existingApp.status === 'rejected'
                                ? 'error'
                                : 'warning'
                          }
                          className="px-3 py-1 text-xs uppercase"
                        >
                          {existingApp.status === 'pending'
                            ? 'Application Pending'
                            : existingApp.status}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenApplyModal(role)}
                          leftIcon={<Send className="h-3.5 w-3.5" />}
                        >
                          Apply for Role
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardBody>
          </Card>

          {/* Project Team & Contributors Roster */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Project Team &amp; Contributors ({contributors.length})
                </h2>
              </div>
              <Badge variant="success" className="text-xs">
                Verified Roster
              </Badge>
            </CardHeader>
            <CardBody className="p-6">
              {contributors.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Recruitment in progress. No student contributors appointed yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contributors.map((contrib) => {
                    const studentName = contrib.applicant?.full_name || 'Student Contributor'
                    const initials = getInitials(studentName)
                    return (
                      <div
                        key={contrib.id}
                        className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-3.5"
                      >
                        <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {studentName}
                          </p>
                          <p className="text-xs font-semibold text-emerald-800 truncate">
                            {contrib.role_applied}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {contrib.applicant?.department || 'UIET Student'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Activity Passport & Guidelines */}
        <div className="space-y-6">
          {/* Passport Credit Card */}
          <Card className="p-6 bg-gradient-to-br from-indigo-900 to-primary text-white space-y-3 shadow-md">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold">Activity Passport Verified</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Contributing as an accepted team member on official UIET projects earns project
              credits and leadership recognition on your student passport.
            </p>
          </Card>

          {/* Contributor Guidelines */}
          <Card className="p-6 space-y-3 text-xs text-gray-600">
            <h3 className="font-bold text-gray-900 text-sm">Contributor Process</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-500">
              <li>Submit your application with relevant skill highlights.</li>
              <li>Club coordinators review submissions within 3-5 days.</li>
              <li>Accepted contributors join the project repository and workspace.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Apply for Role Modal */}
      <Modal
        isOpen={Boolean(selectedRoleForApply)}
        onClose={() => setSelectedRoleForApply(null)}
        title={`Apply for ${selectedRoleForApply?.role || 'Role'}`}
      >
        <form onSubmit={handleSubmitApplication} className="space-y-4">
          {applyError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-error">
              {applyError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Position
            </label>
            <p className="text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              {selectedRoleForApply?.role} &bull; {project.title}
            </p>
          </div>

          <Input
            label="Relevant Skills & Technologies"
            type="text"
            placeholder="e.g. React, TypeScript, LangChain, Git, REST APIs"
            value={skillsSummary}
            onChange={(e) => setSkillsSummary(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Statement of Interest &amp; What You Can Contribute
            </label>
            <textarea
              rows={4}
              placeholder="Describe your prior experience, what you hope to build on this team, and your weekly time availability..."
              value={statementOfInterest}
              onChange={(e) => setStatementOfInterest(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <Input
            label="Portfolio / GitHub / Project Links (Optional)"
            type="text"
            placeholder="e.g. https://github.com/username or LinkedIn profile"
            value={portfolioLinks}
            onChange={(e) => setPortfolioLinks(e.target.value)}
          />

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedRoleForApply(null)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isApplying}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
