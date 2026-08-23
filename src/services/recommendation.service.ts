import { supabase } from '@/lib/supabase'
import type { Profile, Club, CampusEvent, CampusProject } from '@/types'

export interface RecommendedClub extends Club {
  matchScore: number
  matchReasons: string[]
  isJoined?: boolean
}

export interface RecommendedEvent extends CampusEvent {
  matchScore: number
  matchReasons: string[]
  isRegistered?: boolean
}

export interface RecommendedProject extends CampusProject {
  matchScore: number
  matchReasons: string[]
  hasApplied?: boolean
}

export interface PersonalizedRecommendations {
  clubs: RecommendedClub[]
  events: RecommendedEvent[]
  projects: RecommendedProject[]
}

// Interest & Category Mapping dictionary
const CATEGORY_INTEREST_MAP: Record<string, string[]> = {
  'AI & Data Science': [
    'artificial intelligence',
    'machine learning',
    'data science',
    'deep learning',
    'python',
  ],
  'DSA & Coding': [
    'competitive coding',
    'dsa',
    'algorithms',
    'c++',
    'java',
    'problem solving',
  ],
  'Design & Digital Content': [
    'ui/ux',
    'design',
    'graphic design',
    'video editing',
    'media',
    'frontend',
  ],
  'Innovation & Projects': [
    'web & app development',
    'robotics',
    'iot',
    'embedded systems',
    'fullstack',
    'hackathons',
  ],
  'Career Preparation': [
    'interview prep',
    'resume building',
    'career',
    'placements',
    'networking',
  ],
  Wellness: ['yoga', 'mental wellness', 'mindfulness', 'fitness', 'health'],
  Mathematics: ['mathematics', 'logic', 'statistics', 'quantitative aptitude'],
  'Public Speaking & Debates': ['public speaking', 'debates', 'communication', 'leadership'],
}

export const recommendationService = {
  /**
   * Calculate matching score (0 - 100) and rationale for a club.
   */
  calculateClubMatch(
    profile: Profile,
    club: Club,
    joinedClubIds: Set<string>
  ): { matchScore: number; matchReasons: string[] } {
    let score = 50 // baseline score
    const reasons: string[] = []

    const userInterests = (profile.interests || []).map((i) => i.toLowerCase())
    const userGoals = (profile.goals || []).map((g) => g.toLowerCase())
    const clubCategory = club.category
    const mappedKeywords = CATEGORY_INTEREST_MAP[clubCategory] || []

    // 1. Direct Category Match with User Interests (+25%)
    const matchedInterests = userInterests.filter((interest) =>
      mappedKeywords.some((keyword) => interest.includes(keyword) || keyword.includes(interest))
    )

    if (matchedInterests.length > 0) {
      score += 25
      reasons.push(`Directly matches your interest in ${matchedInterests[0]}`)
    }

    // 2. Goal Synergy (+15%)
    const goalMatch = userGoals.some(
      (goal) =>
        (clubCategory.includes('Coding') && goal.includes('coding')) ||
        (clubCategory.includes('AI') && goal.includes('skills')) ||
        (clubCategory.includes('Projects') && goal.includes('innovative')) ||
        (clubCategory.includes('Career') && goal.includes('placements'))
    )

    if (goalMatch) {
      score += 15
      reasons.push('Aligns with your primary academic goals')
    }

    // 3. Department Affinity (+10%)
    if (
      profile.department?.includes('Computer Science') ||
      profile.department?.includes('AIML')
    ) {
      if (clubCategory === 'AI & Data Science' || clubCategory === 'DSA & Coding') {
        score += 10
        reasons.push('Highly recommended for CSE & AIML students')
      }
    } else if (profile.department?.includes('Biotechnology') && club.name.includes('Genzyme')) {
      score += 10
      reasons.push('Official society for Biotechnology students')
    }

    if (joinedClubIds.has(club.id)) {
      reasons.unshift('You are an active member')
    }

    // Cap at 98% (or minimum 55%)
    const finalScore = Math.min(98, Math.max(55, score))

    if (reasons.length === 0) {
      reasons.push(`Active community in ${club.category}`)
    }

    return {
      matchScore: finalScore,
      matchReasons: reasons,
    }
  },

  /**
   * Calculate matching score (0 - 100) and rationale for an event.
   */
  calculateEventMatch(
    profile: Profile,
    event: CampusEvent
  ): { matchScore: number; matchReasons: string[] } {
    let score = 55
    const reasons: string[] = []

    const userInterests = (profile.interests || []).map((i) => i.toLowerCase())
    const eventCategory = event.category
    const mappedKeywords = CATEGORY_INTEREST_MAP[eventCategory] || []

    const matchedInterests = userInterests.filter((interest) =>
      mappedKeywords.some((keyword) => interest.includes(keyword) || keyword.includes(interest))
    )

    if (matchedInterests.length > 0) {
      score += 25
      reasons.push(`Topics cover ${matchedInterests[0]}`)
    }

    if (event.event_type === 'hackathon' || event.event_type === 'workshop') {
      score += 15
      reasons.push('Hands-on experiential learning')
    }

    const finalScore = Math.min(99, Math.max(60, score))
    if (reasons.length === 0) {
      reasons.push(`Popular ${event.category} session`)
    }

    return {
      matchScore: finalScore,
      matchReasons: reasons,
    }
  },

  /**
   * Calculate matching score (0 - 100) and rationale for a project.
   */
  calculateProjectMatch(
    profile: Profile,
    project: CampusProject
  ): { matchScore: number; matchReasons: string[] } {
    let score = 60
    const reasons: string[] = []

    const userInterests = (profile.interests || []).map((i) => i.toLowerCase())
    const techStack = (project.tech_stack || []).map((t) => t.toLowerCase())

    const matchedTech = techStack.filter((t) =>
      userInterests.some((interest) => interest.includes(t) || t.includes(interest))
    )

    if (matchedTech.length > 0) {
      score += 25
      reasons.push(`Project uses ${matchedTech.join(', ')}`)
    }

    if (project.open_roles && project.open_roles.length > 0) {
      score += 15
      reasons.push(`${project.open_roles.length} open recruitment roles`)
    }

    const finalScore = Math.min(99, Math.max(65, score))
    if (reasons.length === 0) {
      reasons.push('Great collaborative portfolio builder')
    }

    return {
      matchScore: finalScore,
      matchReasons: reasons,
    }
  },

  /**
   * Fetch ranked recommended clubs for a student.
   */
  async getRecommendedClubs(userId: string): Promise<RecommendedClub[]> {
    try {
      const [profileRes, clubsRes, joinedRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('clubs').select('*, members:club_members(count)'),
        supabase.from('club_members').select('club_id').eq('user_id', userId),
      ])

      const profile = profileRes.data as Profile
      if (!profile) return []

      const joinedClubIds = new Set((joinedRes.data || []).map((j) => j.club_id))

      const formattedClubs: RecommendedClub[] = (clubsRes.data || []).map((c: any) => {
        const clubObj: Club = {
          ...c,
          member_count: c.members?.[0]?.count || 0,
        }
        const { matchScore, matchReasons } = this.calculateClubMatch(
          profile,
          clubObj,
          joinedClubIds
        )
        return {
          ...clubObj,
          matchScore,
          matchReasons,
          isJoined: joinedClubIds.has(clubObj.id),
        }
      })

      // Sort descending by matchScore
      return formattedClubs.sort((a, b) => b.matchScore - a.matchScore)
    } catch (err) {
      console.error('Error fetching recommended clubs:', err)
      return []
    }
  },

  /**
   * Fetch ranked recommended events for a student.
   */
  async getRecommendedEvents(userId: string): Promise<RecommendedEvent[]> {
    try {
      const [profileRes, eventsRes, registrationsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('events')
          .select('*, club:clubs(*), registrations:event_registrations(count)')
          .order('start_time', { ascending: true }),
        supabase.from('event_registrations').select('event_id').eq('user_id', userId),
      ])

      const profile = profileRes.data as Profile
      if (!profile) return []

      const registeredEventIds = new Set(
        (registrationsRes.data || []).map((r) => r.event_id)
      )

      const formattedEvents: RecommendedEvent[] = (eventsRes.data || []).map((e: any) => {
        const eventObj: CampusEvent = {
          ...e,
          registration_count: e.registrations?.[0]?.count || 0,
        }
        const { matchScore, matchReasons } = this.calculateEventMatch(profile, eventObj)
        return {
          ...eventObj,
          matchScore,
          matchReasons,
          isRegistered: registeredEventIds.has(eventObj.id),
        }
      })

      return formattedEvents.sort((a, b) => b.matchScore - a.matchScore)
    } catch (err) {
      console.error('Error fetching recommended events:', err)
      return []
    }
  },

  /**
   * Fetch ranked recommended development projects for a student.
   */
  async getRecommendedProjects(userId: string): Promise<RecommendedProject[]> {
    try {
      const [profileRes, projectsRes, appsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('projects')
          .select('*, club:clubs(*), author:profiles!projects_created_by_fkey(*)')
          .order('created_at', { ascending: false }),
        supabase.from('project_applications').select('project_id').eq('applicant_id', userId),
      ])

      const profile = profileRes.data as Profile
      if (!profile) return []

      const appliedProjectIds = new Set((appsRes.data || []).map((a) => a.project_id))

      const formattedProjects: RecommendedProject[] = (projectsRes.data || []).map(
        (p: any) => {
          const { matchScore, matchReasons } = this.calculateProjectMatch(profile, p)
          return {
            ...p,
            matchScore,
            matchReasons,
            hasApplied: appliedProjectIds.has(p.id),
          }
        }
      )

      return formattedProjects.sort((a, b) => b.matchScore - a.matchScore)
    } catch (err) {
      console.error('Error fetching recommended projects:', err)
      return []
    }
  },

  /**
   * Fetch all personalized recommendations in one call.
   */
  async getAllRecommendations(userId: string): Promise<PersonalizedRecommendations> {
    const [clubs, events, projects] = await Promise.all([
      this.getRecommendedClubs(userId),
      this.getRecommendedEvents(userId),
      this.getRecommendedProjects(userId),
    ])

    return { clubs, events, projects }
  },
}
