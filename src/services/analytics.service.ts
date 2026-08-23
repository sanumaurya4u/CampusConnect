import { supabase } from '@/lib/supabase'

export interface CategoryMetric {
  category: string
  activitiesCount: number
  percentage: number
}

export interface ClubProductivity {
  clubId: string
  clubName: string
  category: string
  membersCount: number
  eventsCount: number
  projectsCount: number
  collaborationsCount: number
  productivityScore: number
}

export interface PassportTierDistribution {
  tier: 'Platinum (15+ Credits)' | 'Gold (10-14 Credits)' | 'Silver (5-9 Credits)' | 'Bronze (1-4 Credits)'
  studentCount: number
  percentage: number
}

export interface InstitutionalAnalyticsData {
  totalStudents: number
  totalRegistrations: number
  totalAttended: number
  attendanceConversionRate: number
  totalCreditsAwarded: number
  categoryMetrics: CategoryMetric[]
  clubProductivityList: ClubProductivity[]
  tierDistribution: PassportTierDistribution[]
  naacSummary: {
    totalWorkshopsAndHackathons: number
    totalStudentHours: number
    crossClubInitiativesCount: number
    activeStudentEngagementRate: number
  }
}

export const analyticsService = {
  /**
   * Compute comprehensive institutional intelligence & accreditation metrics.
   */
  async getInstitutionalAnalytics(): Promise<InstitutionalAnalyticsData> {
    try {
      const [
        studentsRes,
        clubsRes,
        eventsRes,
        registrationsRes,
        projectsRes,
        activitiesRes,
        collabsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id, department').eq('role', 'student'),
        supabase.from('clubs').select('*, members:club_members(count)'),
        supabase.from('events').select('id, club_id, category'),
        supabase.from('event_registrations').select('id, status'),
        supabase.from('projects').select('id, club_id, category'),
        supabase.from('student_activities').select('id, user_id, activity_type, metadata'),
        supabase.from('club_collaborations').select('id, status').eq('status', 'accepted'),
      ])

      const totalStudents = studentsRes.data?.length || 1
      const totalRegistrations = registrationsRes.data?.length || 0
      const totalAttended = registrationsRes.data?.filter((r) => r.status === 'attended').length || 0
      const attendanceConversionRate =
        totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0

      // Calculate total credits awarded
      let totalCreditsAwarded = 0
      const studentCreditMap: Record<string, number> = {}

      activitiesRes.data?.forEach((act) => {
        const creds = Number((act.metadata as any)?.credits || 1)
        totalCreditsAwarded += creds
        studentCreditMap[act.user_id] = (studentCreditMap[act.user_id] || 0) + creds
      })

      // Category metrics
      const categoryCountMap: Record<string, number> = {
        'AI & Data Science': 0,
        'DSA & Coding': 0,
        'Design & Digital Content': 0,
        'Innovation & Projects': 0,
        'Career Preparation': 0,
        Wellness: 0,
        Mathematics: 0,
        'Public Speaking & Debates': 0,
      }

      clubsRes.data?.forEach((c) => {
        if (categoryCountMap[c.category] !== undefined) {
          categoryCountMap[c.category] = (categoryCountMap[c.category] ?? 0) + 1
        }
      })
      eventsRes.data?.forEach((e) => {
        if (categoryCountMap[e.category] !== undefined) {
          categoryCountMap[e.category] = (categoryCountMap[e.category] ?? 0) + 2
        }
      })
      projectsRes.data?.forEach((p) => {
        if (categoryCountMap[p.category] !== undefined) {
          categoryCountMap[p.category] = (categoryCountMap[p.category] ?? 0) + 3
        }
      })

      const totalCategoryPoints = Object.values(categoryCountMap).reduce((a, b) => a + b, 0) || 1

      const categoryMetrics: CategoryMetric[] = Object.entries(categoryCountMap).map(
        ([category, count]) => ({
          category,
          activitiesCount: count,
          percentage: Math.round((count / totalCategoryPoints) * 100),
        })
      )

      // Club productivity rankings
      const clubProductivityList: ClubProductivity[] = (clubsRes.data || []).map((c: any) => {
        const membersCount = c.members?.[0]?.count || 0
        const eventsCount = eventsRes.data?.filter((e) => e.club_id === c.id).length || 0
        const projectsCount = projectsRes.data?.filter((p) => p.club_id === c.id).length || 0
        const collabsCount =
          collabsRes.data?.filter((col: any) => col.requester_club_id === c.id || col.target_club_id === c.id)
            .length || 0

        const productivityScore =
          membersCount * 2 + eventsCount * 10 + projectsCount * 15 + collabsCount * 8

        return {
          clubId: c.id,
          clubName: c.name,
          category: c.category,
          membersCount,
          eventsCount,
          projectsCount,
          collaborationsCount: collabsCount,
          productivityScore,
        }
      }).sort((a, b) => b.productivityScore - a.productivityScore)

      // Student Passport Tier distribution
      const tiers = {
        platinum: 0,
        gold: 0,
        silver: 0,
        bronze: 0,
      }

      Object.values(studentCreditMap).forEach((creds) => {
        if (creds >= 15) tiers.platinum += 1
        else if (creds >= 10) tiers.gold += 1
        else if (creds >= 5) tiers.silver += 1
        else tiers.bronze += 1
      })

      const totalScoredStudents = Math.max(1, Object.keys(studentCreditMap).length)

      const tierDistribution: PassportTierDistribution[] = [
        {
          tier: 'Platinum (15+ Credits)',
          studentCount: tiers.platinum,
          percentage: Math.round((tiers.platinum / totalScoredStudents) * 100),
        },
        {
          tier: 'Gold (10-14 Credits)',
          studentCount: tiers.gold,
          percentage: Math.round((tiers.gold / totalScoredStudents) * 100),
        },
        {
          tier: 'Silver (5-9 Credits)',
          studentCount: tiers.silver,
          percentage: Math.round((tiers.silver / totalScoredStudents) * 100),
        },
        {
          tier: 'Bronze (1-4 Credits)',
          studentCount: tiers.bronze,
          percentage: Math.round((tiers.bronze / totalScoredStudents) * 100),
        },
      ]

      return {
        totalStudents,
        totalRegistrations,
        totalAttended,
        attendanceConversionRate,
        totalCreditsAwarded,
        categoryMetrics,
        clubProductivityList,
        tierDistribution,
        naacSummary: {
          totalWorkshopsAndHackathons: eventsRes.data?.length || 0,
          totalStudentHours: totalAttended * 3 + (projectsRes.data?.length || 0) * 20,
          crossClubInitiativesCount: collabsRes.data?.length || 0,
          activeStudentEngagementRate: Math.min(
            100,
            Math.round((Object.keys(studentCreditMap).length / totalStudents) * 100)
          ),
        },
      }
    } catch (err) {
      console.error('Failed to compute institutional analytics:', err)
      return {
        totalStudents: 0,
        totalRegistrations: 0,
        totalAttended: 0,
        attendanceConversionRate: 0,
        totalCreditsAwarded: 0,
        categoryMetrics: [],
        clubProductivityList: [],
        tierDistribution: [],
        naacSummary: {
          totalWorkshopsAndHackathons: 0,
          totalStudentHours: 0,
          crossClubInitiativesCount: 0,
          activeStudentEngagementRate: 0,
        },
      }
    }
  },
}
