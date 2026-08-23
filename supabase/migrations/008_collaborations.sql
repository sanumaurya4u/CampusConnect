-- Migration: 008_collaborations.sql
-- Description: Create club_collaborations table, constraints, indexes, triggers, and Row Level Security policies.

-- 1. Create club_collaborations table
CREATE TABLE IF NOT EXISTS public.club_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    target_club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposed_dates TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
    initiator_notes TEXT,
    target_response TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_different_clubs CHECK (initiator_club_id <> target_club_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_collab_initiator_club ON public.club_collaborations(initiator_club_id);
CREATE INDEX IF NOT EXISTS idx_collab_target_club ON public.club_collaborations(target_club_id);
CREATE INDEX IF NOT EXISTS idx_collab_status ON public.club_collaborations(status);

-- 3. Trigger
DROP TRIGGER IF EXISTS handle_collaborations_updated_at ON public.club_collaborations;
CREATE TRIGGER handle_collaborations_updated_at
    BEFORE UPDATE ON public.club_collaborations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security
ALTER TABLE public.club_collaborations ENABLE ROW LEVEL SECURITY;

-- SELECT: Public can see accepted and completed collaborations. Club organizers/author/admin can see pending/rejected proposals.
DROP POLICY IF EXISTS "Public and involved clubs can view collaborations" ON public.club_collaborations;
CREATE POLICY "Public and involved clubs can view collaborations"
    ON public.club_collaborations
    FOR SELECT
    TO authenticated, anon
    USING (
        status IN ('accepted', 'completed')
        OR auth.uid() = created_by
        OR public.is_admin()
        OR public.is_club_organizer(initiator_club_id)
        OR public.is_club_organizer(target_club_id)
    );

-- INSERT: Organizers of initiator club, faculty, or admin can create proposals
DROP POLICY IF EXISTS "Organizers can create collaboration proposals" ON public.club_collaborations;
CREATE POLICY "Organizers can create collaboration proposals"
    ON public.club_collaborations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR public.is_club_organizer(initiator_club_id)
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('organizer', 'faculty', 'admin')
    );

-- UPDATE: Organizers of initiator club, target club, author, or admin can update
DROP POLICY IF EXISTS "Involved clubs can update collaborations" ON public.club_collaborations;
CREATE POLICY "Involved clubs can update collaborations"
    ON public.club_collaborations
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR public.is_club_organizer(initiator_club_id)
        OR public.is_club_organizer(target_club_id)
    )
    WITH CHECK (
        public.is_admin()
        OR auth.uid() = created_by
        OR public.is_club_organizer(initiator_club_id)
        OR public.is_club_organizer(target_club_id)
    );

-- DELETE: Initiator or admin can delete/withdraw proposals
DROP POLICY IF EXISTS "Initiators and admin can delete proposals" ON public.club_collaborations;
CREATE POLICY "Initiators and admin can delete proposals"
    ON public.club_collaborations
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR public.is_club_organizer(initiator_club_id)
    );
