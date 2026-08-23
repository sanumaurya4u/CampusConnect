-- Migration: 005_announcements.sql
-- Description: Create announcements table, indexes, triggers, and Row Level Security policies.

-- 1. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_club_id ON public.announcements(club_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at DESC);

-- 3. Automatic updated_at trigger
DROP TRIGGER IF EXISTS handle_announcements_updated_at ON public.announcements;
CREATE TRIGGER handle_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- SELECT: Public and authenticated can view published announcements. Organizers/Admins can view drafts for their clubs.
DROP POLICY IF EXISTS "Published announcements are viewable by all" ON public.announcements;
CREATE POLICY "Published announcements are viewable by all"
    ON public.announcements
    FOR SELECT
    TO authenticated, anon
    USING (
        status = 'published'
        OR auth.uid() = created_by
        OR public.is_admin()
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
    );

-- INSERT: Organizers of the club, faculty, or admins can create announcements
DROP POLICY IF EXISTS "Organizers and admin can create announcements" ON public.announcements;
CREATE POLICY "Organizers and admin can create announcements"
    ON public.announcements
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('organizer', 'faculty', 'admin')
    );

-- UPDATE: Organizers of the club, author, or admins can update announcements
DROP POLICY IF EXISTS "Organizers and author can update announcements" ON public.announcements;
CREATE POLICY "Organizers and author can update announcements"
    ON public.announcements
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

-- DELETE: Organizers of the club, author, or admins can delete announcements
DROP POLICY IF EXISTS "Organizers and author can delete announcements" ON public.announcements;
CREATE POLICY "Organizers and author can delete announcements"
    ON public.announcements
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR (club_id IS NOT NULL AND public.is_club_organizer(club_id))
    );
