-- Migration: 006_events_and_registrations.sql
-- Description: Create events and event_registrations tables, indexes, triggers, and Row Level Security policies.

-- 1. Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'seminar', 'hackathon', 'competition', 'cultural', 'sports', 'webinar', 'general')) DEFAULT 'workshop',
    venue TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    max_capacity INT,
    banner_url TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'completed', 'cancelled')) DEFAULT 'published',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('registered', 'cancelled', 'attended', 'waitlisted')) DEFAULT 'registered',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_in_at TIMESTAMPTZ,
    UNIQUE(event_id, user_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

-- 4. Triggers
DROP TRIGGER IF EXISTS handle_events_updated_at ON public.events;
CREATE TRIGGER handle_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- EVENTS POLICIES
DROP POLICY IF EXISTS "Published events are viewable by all" ON public.events;
CREATE POLICY "Published events are viewable by all"
    ON public.events
    FOR SELECT
    TO authenticated, anon
    USING (
        status = 'published'
        OR auth.uid() = created_by
        OR public.is_admin()
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
    );

DROP POLICY IF EXISTS "Organizers and admins can create events" ON public.events;
CREATE POLICY "Organizers and admins can create events"
    ON public.events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('organizer', 'faculty', 'admin')
    );

DROP POLICY IF EXISTS "Organizers and admins can update events" ON public.events;
CREATE POLICY "Organizers and admins can update events"
    ON public.events
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
    )
    WITH CHECK (
        public.is_admin()
        OR auth.uid() = created_by
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
    );

DROP POLICY IF EXISTS "Organizers and admins can delete events" ON public.events;
CREATE POLICY "Organizers and admins can delete events"
    ON public.events
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
    );

-- EVENT REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "Users and organizers can view event registrations" ON public.event_registrations;
CREATE POLICY "Users and organizers can view event registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_id
            AND (
                e.created_by = auth.uid()
                OR (e.club_id IS NOT NULL AND public.is_club_organizer(e.club_id))
            )
        )
    );

DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Users can register for events"
    ON public.event_registrations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Users can cancel or organizers can check in registrations" ON public.event_registrations;
CREATE POLICY "Users can cancel or organizers can check in registrations"
    ON public.event_registrations
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_id
            AND (
                e.created_by = auth.uid()
                OR (e.club_id IS NOT NULL AND public.is_club_organizer(e.club_id))
            )
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_id
            AND (
                e.created_by = auth.uid()
                OR (e.club_id IS NOT NULL AND public.is_club_organizer(e.club_id))
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete own registration" ON public.event_registrations;
CREATE POLICY "Users can delete own registration"
    ON public.event_registrations
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id
        OR public.is_admin()
    );
