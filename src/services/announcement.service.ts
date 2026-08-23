import { supabase } from '@/lib/supabase'
import type { Announcement, AnnouncementStatus } from '@/types'

export interface CreateAnnouncementParams {
  clubId?: string | null
  title: string
  content: string
  createdBy: string
  status?: AnnouncementStatus
}

export interface UpdateAnnouncementParams {
  title?: string
  content?: string
  status?: AnnouncementStatus
}

export const announcementService = {
  /**
   * Fetch announcements for a specific club or campus-wide.
   */
  async getClubAnnouncements(clubId?: string, includeDrafts: boolean = false): Promise<Announcement[]> {
    let query = supabase
      .from('announcements')
      .select('*, author:profiles!announcements_created_by_fkey(*)')
      .order('published_at', { ascending: false })

    if (clubId) {
      query = query.eq('club_id', clubId)
    }

    if (!includeDrafts) {
      query = query.eq('status', 'published')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching announcements:', error.message)
      return []
    }

    return (data || []) as Announcement[]
  },

  /**
   * Create a new announcement.
   */
  async createAnnouncement({
    clubId = null,
    title,
    content,
    createdBy,
    status = 'published',
  }: CreateAnnouncementParams): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        club_id: clubId,
        title,
        content,
        created_by: createdBy,
        status,
        published_at: new Date().toISOString(),
      })
      .select('*, author:profiles!announcements_created_by_fkey(*)')
      .single()

    if (error) {
      throw error
    }

    return data as Announcement
  },

  /**
   * Update an existing announcement.
   */
  async updateAnnouncement(id: string, updates: UpdateAnnouncementParams): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, author:profiles!announcements_created_by_fkey(*)')
      .single()

    if (error) {
      throw error
    }

    return data as Announcement
  },

  /**
   * Delete an announcement.
   */
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id)

    if (error) {
      throw error
    }
  },
}
