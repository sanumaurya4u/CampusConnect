import { supabase } from '@/lib/supabase'
import type { ClubCollaboration } from '@/types'

export interface CreateCollaborationParams {
  initiatorClubId: string
  targetClubId: string
  eventId?: string | null
  title: string
  description: string
  proposedDates?: string | null
  initiatorNotes?: string | null
  createdBy: string
}

export const collaborationService = {
  /**
   * Fetch all collaborations for a specific club (incoming, outgoing, accepted).
   */
  async getClubCollaborations(clubId: string): Promise<ClubCollaboration[]> {
    const { data, error } = await supabase
      .from('club_collaborations')
      .select(
        '*, initiator_club:clubs!club_collaborations_initiator_club_id_fkey(*), target_club:clubs!club_collaborations_target_club_id_fkey(*), event:events(*), proposer:profiles!club_collaborations_created_by_fkey(*)'
      )
      .or(`initiator_club_id.eq.${clubId},target_club_id.eq.${clubId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching club collaborations:', error.message)
      return []
    }

    return (data || []) as unknown as ClubCollaboration[]
  },

  /**
   * Fetch public accepted and completed collaborations for a club.
   */
  async getPublicClubCollaborations(clubId: string): Promise<ClubCollaboration[]> {
    const { data, error } = await supabase
      .from('club_collaborations')
      .select(
        '*, initiator_club:clubs!club_collaborations_initiator_club_id_fkey(*), target_club:clubs!club_collaborations_target_club_id_fkey(*), event:events(*)'
      )
      .or(`initiator_club_id.eq.${clubId},target_club_id.eq.${clubId}`)
      .in('status', ['accepted', 'completed'])
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching public collaborations:', error.message)
      return []
    }

    return (data || []) as unknown as ClubCollaboration[]
  },

  /**
   * Create a new cross-club collaboration proposal.
   */
  async createCollaborationProposal(params: CreateCollaborationParams): Promise<ClubCollaboration> {
    const {
      initiatorClubId,
      targetClubId,
      eventId = null,
      title,
      description,
      proposedDates = null,
      initiatorNotes = null,
      createdBy,
    } = params

    if (initiatorClubId === targetClubId) {
      throw new Error('A club cannot collaborate with itself.')
    }

    const { data, error } = await supabase
      .from('club_collaborations')
      .insert({
        initiator_club_id: initiatorClubId,
        target_club_id: targetClubId,
        event_id: eventId,
        title,
        description,
        proposed_dates: proposedDates,
        initiator_notes: initiatorNotes,
        status: 'pending',
        created_by: createdBy,
      })
      .select(
        '*, initiator_club:clubs!club_collaborations_initiator_club_id_fkey(*), target_club:clubs!club_collaborations_target_club_id_fkey(*)'
      )
      .single()

    if (error) throw error

    return data as unknown as ClubCollaboration
  },

  /**
   * Respond (accept or decline) to a collaboration proposal.
   */
  async respondToProposal(
    collaborationId: string,
    status: 'accepted' | 'rejected',
    targetResponse?: string
  ): Promise<ClubCollaboration> {
    const { data, error } = await supabase
      .from('club_collaborations')
      .update({
        status,
        target_response: targetResponse || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', collaborationId)
      .select(
        '*, initiator_club:clubs!club_collaborations_initiator_club_id_fkey(*), target_club:clubs!club_collaborations_target_club_id_fkey(*)'
      )
      .single()

    if (error) throw error

    return data as unknown as ClubCollaboration
  },

  /**
   * Mark a collaboration as successfully completed.
   */
  async completeCollaboration(collaborationId: string): Promise<void> {
    const { error } = await supabase
      .from('club_collaborations')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', collaborationId)

    if (error) throw error
  },
}
