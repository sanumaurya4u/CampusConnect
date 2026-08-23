import { supabase } from '@/lib/supabase'
import type { Club, ClubMember, ClubApplication, ClubStats, UserRole } from '@/types'

export interface UpdateClubParams {
  description?: string | null
  objective?: string | null
  activities?: string | null
  faculty_incharge?: string | null
  coordinators?: { name: string; branch?: string; roll_no?: string }[]
}

export const organizerService = {
  /**
   * Fetch clubs managed by an organizer or faculty supervisor.
   * If the user is admin or general organizer, returns clubs or assigned club.
   */
  async getOrganizerClubs(userId: string, role: UserRole): Promise<Club[]> {
    if (role === 'admin') {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []) as Club[]
    }

    // Check clubs where user is explicitly added as coordinator/faculty
    const { data: memberClubs, error: memberError } = await supabase
      .from('club_members')
      .select('club_id, membership_role, clubs(*)')
      .eq('user_id', userId)
      .in('membership_role', ['coordinator', 'faculty'])
      .eq('status', 'active')

    if (memberError) {
      console.error('Error fetching member clubs:', memberError.message)
    }

    if (memberClubs && memberClubs.length > 0) {
      return memberClubs.map((m) => m.clubs as unknown as Club)
    }

    // Fallback: For coordinators who just registered, return active clubs so they can select and manage
    const { data: allClubs, error: allClubsError } = await supabase
      .from('clubs')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (allClubsError) throw allClubsError
    return (allClubs || []) as Club[]
  },

  /**
   * Fetch members of a club with complete profile records.
   */
  async getClubMembersDetailed(clubId: string): Promise<ClubMember[]> {
    const { data, error } = await supabase
      .from('club_members')
      .select('id, club_id, user_id, membership_role, status, joined_at, profile:profiles!club_members_user_id_fkey(*)')
      .eq('club_id', clubId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching club members:', error.message)
      return []
    }

    return (data || []) as unknown as ClubMember[]
  },

  /**
   * Fetch membership applications for a club.
   */
  async getClubApplications(clubId: string): Promise<ClubApplication[]> {
    const { data, error } = await supabase
      .from('club_applications')
      .select('*, applicant:profiles!club_applications_applicant_id_fkey(*)')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error.message)
      return []
    }

    return (data || []) as ClubApplication[]
  },

  /**
   * Review (approve or reject) a club application.
   */
  async reviewApplication(
    applicationId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    clubId: string,
    applicantId: string
  ): Promise<void> {
    // 1. Update application status
    const { error: appError } = await supabase
      .from('club_applications')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)

    if (appError) throw appError

    // 2. If approved, add applicant to club_members
    if (status === 'approved') {
      const { error: memberError } = await supabase
        .from('club_members')
        .upsert(
          {
            club_id: clubId,
            user_id: applicantId,
            membership_role: 'member',
            status: 'active',
            joined_at: new Date().toISOString(),
          },
          { onConflict: 'club_id,user_id' }
        )

      if (memberError) throw memberError
    }
  },

  /**
   * Remove a member from the club.
   */
  async removeMember(clubId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Update club profile information.
   */
  async updateClubProfile(clubId: string, updates: UpdateClubParams): Promise<Club> {
    const { data, error } = await supabase
      .from('clubs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clubId)
      .select()
      .single()

    if (error) throw error
    return data as Club
  },

  /**
   * Get operational stats for an organizer dashboard.
   */
  async getClubStats(clubId: string): Promise<ClubStats> {
    const [membersRes, applicationsRes, announcementsRes] = await Promise.all([
      supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('status', 'active'),
      supabase
        .from('club_applications')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('status', 'pending'),
      supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('status', 'published'),
    ])

    return {
      totalMembers: membersRes.count || 0,
      pendingApplications: applicationsRes.count || 0,
      totalAnnouncements: announcementsRes.count || 0,
    }
  },
}
