import { supabase } from '@/lib/supabase'
import type { Club, ClubMember } from '@/types'

export interface GetClubsParams {
  category?: string
  searchQuery?: string
}

export const clubService = {
  /**
   * Fetch all active campus clubs with optional filtering and search.
   */
  async getClubs({ category, searchQuery }: GetClubsParams = {}): Promise<Club[]> {
    let query = supabase
      .from('clubs')
      .select('*, club_members(count)')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (searchQuery && searchQuery.trim()) {
      const term = searchQuery.trim()
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,objective.ilike.%${term}%,category.ilike.%${term}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching clubs:', error.message)
      throw error
    }

    return (data || []).map((row) => {
      // Extract count from joined aggregate
      const memberCount =
        Array.isArray(row.club_members) && row.club_members[0]
          ? (row.club_members[0] as { count: number }).count
          : 0

      return {
        ...row,
        member_count: memberCount,
      } as Club
    })
  },

  /**
   * Fetch a single club by its URL-friendly slug.
   */
  async getClubBySlug(slug: string): Promise<Club | null> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*, club_members(count)')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching club with slug ${slug}:`, error.message)
      throw error
    }

    if (!data) return null

    const memberCount =
      Array.isArray(data.club_members) && data.club_members[0]
        ? (data.club_members[0] as { count: number }).count
        : 0

    return {
      ...data,
      member_count: memberCount,
    } as Club
  },

  /**
   * Check user's membership status for a given club.
   */
  async getMembershipStatus(clubId: string, userId: string): Promise<'none' | 'member' | 'coordinator' | 'faculty'> {
    const { data, error } = await supabase
      .from('club_members')
      .select('membership_role, status')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data || data.status !== 'active') {
      return 'none'
    }

    if (data.membership_role === 'coordinator') return 'coordinator'
    if (data.membership_role === 'faculty') return 'faculty'
    return 'member'
  },

  /**
   * Join a club directly.
   */
  async joinClub(clubId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: userId,
        membership_role: 'member',
        status: 'active',
      })

    if (error) {
      // If user is already a member, ignore duplicate error
      if (error.code === '23505') {
        return
      }
      throw error
    }
  },

  /**
   * Leave a club.
   */
  async leaveClub(clubId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }
  },

  /**
   * Fetch all clubs joined by a student.
   */
  async getUserClubs(userId: string): Promise<ClubMember[]> {
    const { data, error } = await supabase
      .from('club_members')
      .select('id, club_id, user_id, membership_role, status, joined_at, clubs(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching user clubs:', error.message)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      club_id: row.club_id,
      user_id: row.user_id,
      membership_role: row.membership_role,
      status: row.status,
      joined_at: row.joined_at,
      club: row.clubs as unknown as Club,
    }))
  },

  /**
   * Get active members count for a club.
   */
  async getClubMembersCount(clubId: string): Promise<number> {
    const { count, error } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching club members count:', error.message)
      return 0
    }

    return count || 0
  },
}
