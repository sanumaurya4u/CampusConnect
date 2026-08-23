-- Migration: 010_projects_and_applications.sql
-- Description: Create projects and project_applications tables, indexes, triggers, and Row Level Security policies.

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'active', 'completed', 'archived')) DEFAULT 'open',
    open_roles JSONB NOT NULL DEFAULT '[]',
    tech_stack TEXT[] DEFAULT '{}',
    github_url TEXT,
    demo_url TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create project_applications table
CREATE TABLE IF NOT EXISTS public.project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_applied TEXT NOT NULL,
    skills_summary TEXT,
    statement_of_interest TEXT NOT NULL,
    portfolio_links TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT unique_project_applicant_role UNIQUE(project_id, applicant_id, role_applied)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_projects_club ON public.projects(club_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_proj_apps_project ON public.project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_apps_applicant ON public.project_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_proj_apps_status ON public.project_applications(status);

-- 4. Triggers
DROP TRIGGER IF EXISTS handle_projects_updated_at ON public.projects;
CREATE TRIGGER handle_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;

-- Projects RLS
DROP POLICY IF EXISTS "Public can view active and open projects" ON public.projects;
CREATE POLICY "Public can view active and open projects"
    ON public.projects
    FOR SELECT
    TO authenticated, anon
    USING (
        status IN ('open', 'active', 'completed')
        OR auth.uid() = created_by
        OR public.is_admin()
        OR public.is_club_organizer(club_id)
    );

DROP POLICY IF EXISTS "Organizers can create projects" ON public.projects;
CREATE POLICY "Organizers can create projects"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR public.is_club_organizer(club_id)
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('organizer', 'faculty', 'admin')
    );

DROP POLICY IF EXISTS "Organizers can update projects" ON public.projects;
CREATE POLICY "Organizers can update projects"
    ON public.projects
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR public.is_club_organizer(club_id)
    )
    WITH CHECK (
        public.is_admin()
        OR auth.uid() = created_by
        OR public.is_club_organizer(club_id)
    );

DROP POLICY IF EXISTS "Organizers can delete projects" ON public.projects;
CREATE POLICY "Organizers can delete projects"
    ON public.projects
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR auth.uid() = created_by
        OR public.is_club_organizer(club_id)
    );

-- Project Applications RLS
DROP POLICY IF EXISTS "Applicants and organizers can view project applications" ON public.project_applications;
CREATE POLICY "Applicants and organizers can view project applications"
    ON public.project_applications
    FOR SELECT
    TO authenticated
    USING (
        applicant_id = auth.uid()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_applications.project_id
            AND (p.created_by = auth.uid() OR public.is_club_organizer(p.club_id))
        )
    );

DROP POLICY IF EXISTS "Students can apply to projects" ON public.project_applications;
CREATE POLICY "Students can apply to projects"
    ON public.project_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        applicant_id = auth.uid()
    );

DROP POLICY IF EXISTS "Organizers can review project applications" ON public.project_applications;
CREATE POLICY "Organizers can review project applications"
    ON public.project_applications
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_applications.project_id
            AND (p.created_by = auth.uid() OR public.is_club_organizer(p.club_id))
        )
    )
    WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_applications.project_id
            AND (p.created_by = auth.uid() OR public.is_club_organizer(p.club_id))
        )
    );

DROP POLICY IF EXISTS "Applicants can delete their pending applications" ON public.project_applications;
CREATE POLICY "Applicants can delete their pending applications"
    ON public.project_applications
    FOR DELETE
    TO authenticated
    USING (
        applicant_id = auth.uid()
        OR public.is_admin()
    );
