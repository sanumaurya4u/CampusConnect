import { supabase } from '@/lib/supabase'
import type {
  StudentActivity,
  StudentAchievement,
  PassportSummary,
  ActivityType,
} from '@/types'

export const passportService = {
  /**
   * Fetch chronological student activity timeline.
   */
  async getStudentActivities(
    userId: string,
    activityType?: ActivityType
  ): Promise<StudentActivity[]> {
    let query = supabase
      .from('student_activities')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })

    if (activityType) {
      query = query.eq('activity_type', activityType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching student activities:', error.message)
      return []
    }

    return (data || []) as StudentActivity[]
  },

  /**
   * Fetch all earned badges/achievements for a student.
   */
  async getStudentAchievements(userId: string): Promise<StudentAchievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })

    if (error) {
      console.error('Error fetching student achievements:', error.message)
      return []
    }

    return (data || []) as StudentAchievement[]
  },

  /**
   * Compute comprehensive Activity Passport metrics and skills cloud.
   */
  async getPassportSummary(userId: string): Promise<PassportSummary> {
    try {
      // 1. Fetch live activity sources
      const [membershipsRes, attendanceRes, projectsRes, badgesRes] = await Promise.all([
        supabase.from('club_members').select('id, club:clubs(name, category)').eq('user_id', userId),
        supabase
          .from('event_registrations')
          .select('id, status, event:events(title, tags)')
          .eq('user_id', userId)
          .eq('status', 'attended'),
        supabase
          .from('project_applications')
          .select('id, status, role_applied, skills_summary, project:projects(title, tech_stack)')
          .eq('applicant_id', userId)
          .eq('status', 'approved'),
        supabase.from('achievements').select('id').eq('user_id', userId),
      ])

      const totalClubs = membershipsRes.data?.length || 0
      const eventsAttended = attendanceRes.data?.length || 0
      const projectsContributed = projectsRes.data?.length || 0
      const badgesEarned = badgesRes.data?.length || 0

      // Calculate verified credits: 2 credits / club + 3 credits / event + 5 credits / project
      const totalCredits = totalClubs * 2 + eventsAttended * 3 + projectsContributed * 5

      // Synthesize unique skills cloud
      const skillsSet = new Set<string>()

      // Add default foundations if user has joined clubs
      if (totalClubs > 0) {
        skillsSet.add('Campus Leadership')
        skillsSet.add('Collaboration')
      }

      // Add skills from projects
      projectsRes.data?.forEach((p) => {
        if (p.skills_summary) {
          p.skills_summary
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
            .forEach((s: string) => skillsSet.add(s))
        }
        const proj = p.project as { tech_stack?: string[] } | null
        if (proj?.tech_stack && Array.isArray(proj.tech_stack)) {
          proj.tech_stack.forEach((s) => skillsSet.add(s))
        }
      })

      // Add tags from attended events
      attendanceRes.data?.forEach((a) => {
        const ev = a.event as { tags?: string[] } | null
        if (ev?.tags && Array.isArray(ev.tags)) {
          ev.tags.forEach((t) => skillsSet.add(t))
        }
      })

      return {
        totalClubs,
        eventsAttended,
        projectsContributed,
        totalCredits,
        badgesEarned,
        skillsLearned: Array.from(skillsSet),
      }
    } catch (err) {
      console.error('Error calculating passport summary:', err)
      return {
        totalClubs: 0,
        eventsAttended: 0,
        projectsContributed: 0,
        totalCredits: 0,
        badgesEarned: 0,
        skillsLearned: [],
      }
    }
  },

  /**
   * Synchronize activities & evaluate badges.
   */
  async syncAndEvaluateBadges(userId: string): Promise<void> {
    try {
      const summary = await this.getPassportSummary(userId)

      const badgesToAward: Array<{
        key: string
        title: string
        desc: string
        type: 'milestone' | 'event' | 'project' | 'participation'
        icon: string
        condition: boolean
      }> = [
        {
          key: 'club_pioneer',
          title: 'Pioneer Club Member',
          desc: 'Joined an official UIET student society to foster collaborative campus innovation.',
          type: 'milestone',
          icon: 'sparkles',
          condition: summary.totalClubs >= 1,
        },
        {
          key: 'event_enthusiast',
          title: 'Campus Workshop Enthusiast',
          desc: 'Completed verified attendance check-in at technical hands-on sessions.',
          type: 'event',
          icon: 'calendar',
          condition: summary.eventsAttended >= 1,
        },
        {
          key: 'project_builder',
          title: 'Master Project Contributor',
          desc: 'Earned an approved contributor position on an official UIET development project.',
          type: 'project',
          icon: 'code',
          condition: summary.projectsContributed >= 1,
        },
        {
          key: 'campus_all_rounder',
          title: 'UIET All-Rounder',
          desc: 'Achieved multi-faceted engagement across clubs, events, and project recruitment.',
          type: 'participation',
          icon: 'award',
          condition:
            summary.totalClubs >= 1 &&
            summary.eventsAttended >= 1 &&
            summary.projectsContributed >= 1,
        },
      ]

      for (const b of badgesToAward) {
        if (b.condition) {
          await supabase.from('achievements').upsert(
            {
              user_id: userId,
              badge_key: b.key,
              title: b.title,
              description: b.desc,
              achievement_type: b.type,
              badge_icon: b.icon,
              awarded_at: new Date().toISOString(),
            },
            { onConflict: 'user_id, badge_key' }
          )
        }
      }
    } catch (err) {
      console.error('Error syncing activities & badges:', err)
    }
  },
}
