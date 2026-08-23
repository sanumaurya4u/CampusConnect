-- Migration: 003_clubs_and_members.sql
-- Description: Create clubs, club_members, and club_applications tables with RLS and constraints.

-- 1. Create clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    objective TEXT,
    activities TEXT,
    category TEXT NOT NULL,
    faculty_incharge TEXT,
    coordinators JSONB DEFAULT '[]'::jsonb,
    logo_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'archived')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes on clubs
CREATE INDEX IF NOT EXISTS idx_clubs_status ON public.clubs(status);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON public.clubs(slug);

-- 2. Create club_members table
CREATE TABLE IF NOT EXISTS public.club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_role TEXT NOT NULL CHECK (membership_role IN ('member', 'coordinator', 'faculty')) DEFAULT 'member',
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'active',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_club_user UNIQUE (club_id, user_id)
);

-- Indexes on club_members
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON public.club_members(user_id);

-- 3. Create club_applications table
CREATE TABLE IF NOT EXISTS public.club_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT unique_club_applicant UNIQUE (club_id, applicant_id)
);

-- Indexes on club_applications
CREATE INDEX IF NOT EXISTS idx_club_applications_club_id ON public.club_applications(club_id);
CREATE INDEX IF NOT EXISTS idx_club_applications_applicant_id ON public.club_applications(applicant_id);

-- 4. Extend profiles table with interests and goals
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;

-- 5. Updated_at trigger on clubs
DROP TRIGGER IF EXISTS handle_clubs_updated_at ON public.clubs;
CREATE TRIGGER handle_clubs_updated_at
    BEFORE UPDATE ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Helper function to check if user is organizer of a club
CREATE OR REPLACE FUNCTION public.is_club_organizer(target_club_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.club_members
        WHERE club_id = target_club_id
        AND user_id = auth.uid()
        AND membership_role IN ('coordinator', 'faculty')
        AND status = 'active'
    ) OR public.is_admin();
$$;

-- 7. Row Level Security for clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active clubs are viewable by everyone" ON public.clubs;
CREATE POLICY "Active clubs are viewable by everyone"
    ON public.clubs
    FOR SELECT
    TO authenticated, anon
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admin and organizers can update clubs" ON public.clubs;
CREATE POLICY "Admin and organizers can update clubs"
    ON public.clubs
    FOR UPDATE
    TO authenticated
    USING (public.is_club_organizer(id) OR public.is_admin())
    WITH CHECK (public.is_club_organizer(id) OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert clubs" ON public.clubs;
CREATE POLICY "Admin can insert clubs"
    ON public.clubs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- 8. Row Level Security for club_members
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Club members are viewable by authenticated users" ON public.club_members;
CREATE POLICY "Club members are viewable by authenticated users"
    ON public.club_members
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can join clubs" ON public.club_members;
CREATE POLICY "Users can join clubs"
    ON public.club_members
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can leave clubs or admin manage" ON public.club_members;
CREATE POLICY "Users can leave clubs or admin manage"
    ON public.club_members
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin() OR public.is_club_organizer(club_id));

DROP POLICY IF EXISTS "Organizers and admin can update membership" ON public.club_members;
CREATE POLICY "Organizers and admin can update membership"
    ON public.club_members
    FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR public.is_club_organizer(club_id))
    WITH CHECK (public.is_admin() OR public.is_club_organizer(club_id));

-- 9. Row Level Security for club_applications
ALTER TABLE public.club_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicants and organizers can view applications" ON public.club_applications;
CREATE POLICY "Applicants and organizers can view applications"
    ON public.club_applications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = applicant_id OR public.is_admin() OR public.is_club_organizer(club_id));

DROP POLICY IF EXISTS "Users can create their own application" ON public.club_applications;
CREATE POLICY "Users can create their own application"
    ON public.club_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Organizers and admin can update applications" ON public.club_applications;
CREATE POLICY "Organizers and admin can update applications"
    ON public.club_applications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR public.is_club_organizer(club_id))
    WITH CHECK (public.is_admin() OR public.is_club_organizer(club_id));
