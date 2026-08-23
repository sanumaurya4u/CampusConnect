import { supabase } from '@/lib/supabase'
import type {
  CampusProject,
  ProjectApplication,
  ProjectRole,
  ProjectStatus,
  ApplicationStatus,
} from '@/types'

export interface ProjectFilters {
  category?: string
  status?: ProjectStatus | 'all'
  search?: string
  clubId?: string
}

export interface CreateProjectParams {
  clubId: string
  title: string
  description: string
  category: string
  status?: ProjectStatus
  openRoles: ProjectRole[]
  techStack: string[]
  githubUrl?: string | null
  demoUrl?: string | null
  createdBy: string
}

export interface ApplyToProjectParams {
  projectId: string
  applicantId: string
  roleApplied: string
  skillsSummary?: string | null
  statementOfInterest: string
  portfolioLinks?: string | null
}

export const projectService = {
  /**
   * Fetch projects with flexible filters, search, and application metrics.
   */
  async getProjects(filters?: ProjectFilters): Promise<CampusProject[]> {
    let query = supabase
      .from('projects')
      .select('*, club:clubs(*), author:profiles!projects_created_by_fkey(*)')
      .order('created_at', { ascending: false })

    if (filters?.clubId) {
      query = query.eq('club_id', filters.clubId)
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching projects:', error.message)
      return []
    }

    const projects = (data || []) as unknown as CampusProject[]

    // Enrich with application counts
    const enriched = await Promise.all(
      projects.map(async (p) => {
        const { count } = await supabase
          .from('project_applications')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', p.id)

        return {
          ...p,
          application_count: count || 0,
        }
      })
    )

    return enriched
  },

  /**
   * Fetch single project by ID with host club and author.
   */
  async getProjectById(id: string): Promise<CampusProject | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*, club:clubs(*), author:profiles!projects_created_by_fkey(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error.message)
      return null
    }

    const { count } = await supabase
      .from('project_applications')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)

    return {
      ...(data as unknown as CampusProject),
      application_count: count || 0,
    }
  },

  /**
   * Apply for an open role on a project.
   */
  async applyToProject(params: ApplyToProjectParams): Promise<ProjectApplication> {
    const {
      projectId,
      applicantId,
      roleApplied,
      skillsSummary = null,
      statementOfInterest,
      portfolioLinks = null,
    } = params

    const { data, error } = await supabase
      .from('project_applications')
      .insert({
        project_id: projectId,
        applicant_id: applicantId,
        role_applied: roleApplied,
        skills_summary: skillsSummary,
        statement_of_interest: statementOfInterest,
        portfolio_links: portfolioLinks,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return data as unknown as ProjectApplication
  },

  /**
   * Fetch a student's project applications.
   */
  async getUserProjectApplications(userId: string): Promise<ProjectApplication[]> {
    const { data, error } = await supabase
      .from('project_applications')
      .select('*, project:projects!project_applications_project_id_fkey(*, club:clubs(*))')
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching student project applications:', error.message)
      return []
    }

    return (data || []) as unknown as ProjectApplication[]
  },

  /**
   * Fetch all applicants for a specific project (Organizer view).
   */
  async getProjectApplications(projectId: string): Promise<ProjectApplication[]> {
    const { data, error } = await supabase
      .from('project_applications')
      .select('*, applicant:profiles!project_applications_applicant_id_fkey(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching project applications:', error.message)
      return []
    }

    return (data || []) as unknown as ProjectApplication[]
  },

  /**
   * Fetch approved team contributors for a project (Public roster).
   */
  async getProjectContributors(projectId: string): Promise<ProjectApplication[]> {
    const { data, error } = await supabase
      .from('project_applications')
      .select('*, applicant:profiles!project_applications_applicant_id_fkey(*)')
      .eq('project_id', projectId)
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false })

    if (error) {
      console.error('Error fetching project contributors:', error.message)
      return []
    }

    return (data || []) as unknown as ProjectApplication[]
  },

  /**
   * Review (Approve / Reject) a student's project application.
   */
  async reviewProjectApplication(
    applicationId: string,
    status: ApplicationStatus,
    reviewerNotes?: string,
    reviewerId?: string
  ): Promise<ProjectApplication> {
    const { data, error } = await supabase
      .from('project_applications')
      .update({
        status,
        reviewer_notes: reviewerNotes || null,
        reviewed_by: reviewerId || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data as unknown as ProjectApplication
  },

  /**
   * Create a new campus project.
   */
  async createProject(params: CreateProjectParams): Promise<CampusProject> {
    const {
      clubId,
      title,
      description,
      category,
      status = 'open',
      openRoles,
      techStack,
      githubUrl = null,
      demoUrl = null,
      createdBy,
    } = params

    const { data, error } = await supabase
      .from('projects')
      .insert({
        club_id: clubId,
        title,
        description,
        category,
        status,
        open_roles: openRoles,
        tech_stack: techStack,
        github_url: githubUrl,
        demo_url: demoUrl,
        created_by: createdBy,
      })
      .select('*, club:clubs(*)')
      .single()

    if (error) throw error

    return data as unknown as CampusProject
  },

  /**
   * Update an existing project.
   */
  async updateProject(
    id: string,
    params: Partial<CreateProjectParams>
  ): Promise<CampusProject> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (params.title !== undefined) updatePayload.title = params.title
    if (params.description !== undefined) updatePayload.description = params.description
    if (params.category !== undefined) updatePayload.category = params.category
    if (params.status !== undefined) updatePayload.status = params.status
    if (params.openRoles !== undefined) updatePayload.open_roles = params.openRoles
    if (params.techStack !== undefined) updatePayload.tech_stack = params.techStack
    if (params.githubUrl !== undefined) updatePayload.github_url = params.githubUrl
    if (params.demoUrl !== undefined) updatePayload.demo_url = params.demoUrl

    const { data, error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .select('*, club:clubs(*)')
      .single()

    if (error) throw error

    return data as unknown as CampusProject
  },

  /**
   * Delete a project.
   */
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  },
}
