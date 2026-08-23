import { supabase } from '@/lib/supabase'
import type { CampusEvent, EventRegistration, EventType, EventStatus } from '@/types'

export interface GetEventsFilter {
  category?: string
  eventType?: EventType | 'all'
  timeframe?: 'upcoming' | 'past' | 'all'
  clubId?: string
  searchQuery?: string
}

export interface CreateEventParams {
  clubId?: string | null
  title: string
  description: string
  category: string
  eventType: EventType
  venue: string
  startTime: string
  endTime: string
  registrationDeadline?: string | null
  maxCapacity?: number | null
  bannerUrl?: string | null
  tags?: string[]
  status?: EventStatus
  createdBy: string
}

export interface UpdateEventParams {
  title?: string
  description?: string
  category?: string
  eventType?: EventType
  venue?: string
  startTime?: string
  endTime?: string
  registrationDeadline?: string | null
  maxCapacity?: number | null
  bannerUrl?: string | null
  tags?: string[]
  status?: EventStatus
}

export const eventService = {
  /**
   * Fetch events with filters and registration counts.
   */
  async getEvents(filters: GetEventsFilter = {}): Promise<CampusEvent[]> {
    const { category, eventType, timeframe = 'upcoming', clubId, searchQuery } = filters

    let query = supabase
      .from('events')
      .select('*, club:clubs(*), author:profiles!events_created_by_fkey(*)')
      .order('start_time', { ascending: timeframe !== 'past' })

    // Filter by status
    query = query.eq('status', 'published')

    // Filter by timeframe
    const now = new Date().toISOString()
    if (timeframe === 'upcoming') {
      query = query.gte('end_time', now)
    } else if (timeframe === 'past') {
      query = query.lt('end_time', now)
    }

    // Filter by category
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    // Filter by event type
    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType)
    }

    // Filter by club
    if (clubId) {
      query = query.eq('club_id', clubId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events:', error.message)
      return []
    }

    let events = (data || []) as unknown as CampusEvent[]

    // Client-side search query filtering
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
      )
    }

    // Fetch active registration counts for each event
    const eventIds = events.map((e) => e.id)
    if (eventIds.length > 0) {
      const { data: regCounts, error: countError } = await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds)
        .in('status', ['registered', 'attended'])

      if (!countError && regCounts) {
        const countMap: Record<string, number> = {}
        regCounts.forEach((r) => {
          countMap[r.event_id] = (countMap[r.event_id] || 0) + 1
        })
        events = events.map((e) => ({
          ...e,
          registration_count: countMap[e.id] || 0,
        }))
      }
    }

    return events
  },

  /**
   * Fetch a single event by ID.
   */
  async getEventById(id: string): Promise<CampusEvent | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*, club:clubs(*), author:profiles!events_created_by_fkey(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching event by id:', error.message)
      return null
    }

    const event = data as unknown as CampusEvent

    // Fetch registration count
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .in('status', ['registered', 'attended'])

    event.registration_count = count || 0

    return event
  },

  /**
   * Check user's registration for an event.
   */
  async getUserEventRegistration(
    eventId: string,
    userId: string
  ): Promise<EventRegistration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user registration:', error.message)
      return null
    }

    return (data as EventRegistration) || null
  },

  /**
   * Register a user for an event.
   */
  async registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
    // 1. Check event capacity and status
    const event = await this.getEventById(eventId)
    if (!event) throw new Error('Event not found.')

    if (event.status !== 'published') {
      throw new Error('Registration is not open for this event.')
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      throw new Error('Registration deadline has passed.')
    }

    if (event.max_capacity && (event.registration_count || 0) >= event.max_capacity) {
      throw new Error('This event has reached maximum seating capacity.')
    }

    // 2. Insert or reactivate registration
    const { data, error } = await supabase
      .from('event_registrations')
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
          status: 'registered',
          registered_at: new Date().toISOString(),
          check_in_at: null,
        },
        { onConflict: 'event_id,user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return data as EventRegistration
  },

  /**
   * Cancel an event registration.
   */
  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Fetch all events a user has registered for.
   */
  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*, event:events(*, club:clubs(*))')
      .eq('user_id', userId)
      .eq('status', 'registered')
      .order('registered_at', { ascending: false })

    if (error) {
      console.error('Error fetching user registrations:', error.message)
      return []
    }

    return (data || []) as unknown as EventRegistration[]
  },

  /**
   * Create an event (Organizer/Admin).
   */
  async createEvent(params: CreateEventParams): Promise<CampusEvent> {
    const {
      clubId = null,
      title,
      description,
      category,
      eventType,
      venue,
      startTime,
      endTime,
      registrationDeadline = null,
      maxCapacity = null,
      bannerUrl = null,
      tags = [],
      status = 'published',
      createdBy,
    } = params

    const { data, error } = await supabase
      .from('events')
      .insert({
        club_id: clubId,
        title,
        description,
        category,
        event_type: eventType,
        venue,
        start_time: startTime,
        end_time: endTime,
        registration_deadline: registrationDeadline,
        max_capacity: maxCapacity,
        banner_url: bannerUrl,
        tags,
        status,
        created_by: createdBy,
      })
      .select('*, club:clubs(*)')
      .single()

    if (error) throw error

    return data as unknown as CampusEvent
  },

  /**
   * Update an event (Organizer/Admin).
   */
  async updateEvent(id: string, updates: UpdateEventParams): Promise<CampusEvent> {
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.eventType !== undefined) dbUpdates.event_type = updates.eventType
    if (updates.venue !== undefined) dbUpdates.venue = updates.venue
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime
    if (updates.registrationDeadline !== undefined)
      dbUpdates.registration_deadline = updates.registrationDeadline
    if (updates.maxCapacity !== undefined) dbUpdates.max_capacity = updates.maxCapacity
    if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags
    if (updates.status !== undefined) dbUpdates.status = updates.status

    const { data, error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, club:clubs(*)')
      .single()

    if (error) throw error

    return data as unknown as CampusEvent
  },

  /**
   * Delete an event (Organizer/Admin).
   */
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
  },

  /**
   * Fetch registered attendees for an event.
   */
  async getEventAttendees(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*, profile:profiles!event_registrations_user_id_fkey(*)')
      .eq('event_id', eventId)
      .in('status', ['registered', 'attended'])
      .order('registered_at', { ascending: true })

    if (error) {
      console.error('Error fetching event attendees:', error.message)
      return []
    }

    return (data || []) as unknown as EventRegistration[]
  },

  /**
   * Check in / mark attendance for an attendee.
   */
  async markAttendance(registrationId: string, attended: boolean): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({
        status: attended ? 'attended' : 'registered',
        check_in_at: attended ? new Date().toISOString() : null,
      })
      .eq('id', registrationId)

    if (error) throw error
  },
}
