import { supabase } from '@/lib/supabase'
import type { Profile, Club, CampusEvent, UserRole } from '@/types'

export interface AdminMetrics {
  totalStudents: number
  totalOrganizers: number
  totalFaculty: number
  totalClubs: number
  activeClubsCount: number
  totalEvents: number
  totalRegistrations: number
  totalAttended: number
  totalProjects: number
  totalActivitiesLogged: number
}

export interface DepartmentStats {
  department: string
  studentCount: number
  participationCount: number
}

export interface ClubEngagementRank {
  clubId: string
  clubName: string
  category: string
  membersCount: number
  eventsCount: number
  projectsCount: number
}

export interface EngagementReport {
  departmentStats: DepartmentStats[]
  clubRankings: ClubEngagementRank[]
}

export const adminService = {
  /**
   * Fetch system-wide institutional metrics.
   */
  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      const [
        studentsRes,
        organizersRes,
        facultyRes,
        clubsRes,
        eventsRes,
        registrationsRes,
        projectsRes,
        activitiesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'organizer'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
        supabase.from('clubs').select('id, status'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('event_registrations').select('id, status'),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('student_activities').select('id', { count: 'exact', head: true }),
      ])

      const totalClubs = clubsRes.data?.length || 0
      const activeClubsCount = clubsRes.data?.filter((c) => c.status === 'active').length || totalClubs
      const totalRegistrations = registrationsRes.data?.length || 0
      const totalAttended = registrationsRes.data?.filter((r) => r.status === 'attended').length || 0

      return {
        totalStudents: studentsRes.count || 0,
        totalOrganizers: organizersRes.count || 0,
        totalFaculty: facultyRes.count || 0,
        totalClubs,
        activeClubsCount,
        totalEvents: eventsRes.count || 0,
        totalRegistrations,
        totalAttended,
        totalProjects: projectsRes.count || 0,
        totalActivitiesLogged: activitiesRes.count || 0,
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err)
      return {
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
      }
    }
  },

  /**
   * Fetch all users with search and role filter.
   */
  async getAllUsers(options?: { role?: string; search?: string }): Promise<Profile[]> {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

    if (options?.role && options.role !== 'all') {
      query = query.eq('role', options.role)
    }

    if (options?.search) {
      const term = `%${options.search}%`
      query = query.or(`full_name.ilike.${term},email.ilike.${term},department.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error.message)
      return []
    }

    return (data || []) as Profile[]
  },

  /**
   * Update a user's institutional role (Promote / Demote).
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return data as Profile
  },

  /**
   * Fetch all clubs with member count and status.
   */
  async getAllClubs(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*, members:club_members(count)')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching all clubs:', error.message)
      return []
    }

    return (data || []).map((c: any) => ({
      ...c,
      member_count: c.members?.[0]?.count || 0,
    })) as Club[]
  },

  /**
   * Toggle a club's active state (Activate / Suspend).
   */
  async toggleClubStatus(clubId: string, isActive: boolean): Promise<Club> {
    const { data, error } = await supabase
      .from('clubs')
      .update({ status: isActive ? 'active' : 'archived', updated_at: new Date().toISOString() })
      .eq('id', clubId)
      .select()
      .single()

    if (error) throw error

    return data as Club
  },

  /**
   * Provision / Register a new official UIET Student Society.
   */
  async createClub(params: {
    name: string
    category: string
    description: string
    facultyIncharge?: string
    objective?: string
    activities?: string
  }): Promise<Club> {
    const slug = params.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        name: params.name,
        slug,
        category: params.category,
        description: params.description,
        faculty_incharge: params.facultyIncharge || null,
        objective: params.objective || null,
        activities: params.activities || null,
        coordinators: [],
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    return data as Club
  },

  /**
   * Update club parameters & supervisor assignment.
   */
  async updateClub(
    clubId: string,
    updates: Partial<Omit<Club, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Club> {
    const { data, error } = await supabase
      .from('clubs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', clubId)
      .select()
      .single()

    if (error) throw error

    return data as Club
  },

  /**
   * Fetch all campus events with host club details.
   */
  async getAllCampusEvents(): Promise<CampusEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, club:clubs(name, slug), registrations:event_registrations(count)')
      .order('start_time', { ascending: false })

    if (error) {
      console.error('Error fetching all events:', error.message)
      return []
    }

    return (data || []).map((e: any) => ({
      ...e,
      registration_count: e.registrations?.[0]?.count || 0,
    })) as CampusEvent[]
  },

  /**
   * Delete / Cancel an event.
   */
  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) throw error
  },

  /**
   * Generate comprehensive institutional engagement reports.
   */
  async getEngagementReport(): Promise<EngagementReport> {
    try {
      const [profilesRes, activitiesRes, clubsRes, eventsRes, projectsRes] = await Promise.all([
        supabase.from('profiles').select('department').eq('role', 'student'),
        supabase.from('student_activities').select('id, user_id'),
        supabase.from('clubs').select('id, name, category, members:club_members(count)'),
        supabase.from('events').select('id, club_id'),
        supabase.from('projects').select('id, club_id'),
      ])

      // Department breakdown
      const deptMap: Record<string, { studentCount: number; participationCount: number }> = {}

      profilesRes.data?.forEach((p) => {
        const dept = p.department || 'General / Unspecified'
        if (!deptMap[dept]) {
          deptMap[dept] = { studentCount: 0, participationCount: 0 }
        }
        deptMap[dept].studentCount += 1
      })

      const activitiesCount = activitiesRes.data?.length || 0
      const totalStudents = profilesRes.data?.length || 1

      // Approximate participation per department
      Object.keys(deptMap).forEach((dept) => {
        const item = deptMap[dept]
        if (item) {
          const share = item.studentCount / totalStudents
          item.participationCount = Math.round(activitiesCount * share)
        }
      })

      const departmentStats: DepartmentStats[] = Object.entries(deptMap).map(
        ([department, stats]) => ({
          department,
          studentCount: stats.studentCount,
          participationCount: stats.participationCount,
        })
      )

      // Club rankings
      const clubRankings: ClubEngagementRank[] = (clubsRes.data || []).map((c: any) => {
        const eventsCount = eventsRes.data?.filter((e) => e.club_id === c.id).length || 0
        const projectsCount = projectsRes.data?.filter((p) => p.club_id === c.id).length || 0
        const membersCount = c.members?.[0]?.count || 0

        return {
          clubId: c.id,
          clubName: c.name,
          category: c.category,
          membersCount,
          eventsCount,
          projectsCount,
        }
      })

      return {
        departmentStats,
        clubRankings,
      }
    } catch (err) {
      console.error('Error generating engagement report:', err)
      return {
        departmentStats: [],
        clubRankings: [],
      }
    }
  },
}
