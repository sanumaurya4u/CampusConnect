-- ====================================================================
-- Phase 7: Activity Passport & Student Achievements Schema
-- Tables: student_activities, achievements
-- ====================================================================

-- 1. student_activities Table
CREATE TABLE IF NOT EXISTS public.student_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('event', 'project', 'club', 'leadership', 'achievement', 'volunteer')),
    reference_id UUID,
    title TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient timeline querying
CREATE INDEX IF NOT EXISTS idx_student_activities_user_id ON public.student_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_type ON public.student_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_student_activities_occurred ON public.student_activities(occurred_at DESC);

-- Enable RLS
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;

-- 2. achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('participation', 'leadership', 'project', 'event', 'milestone')),
    badge_key TEXT NOT NULL,
    badge_icon TEXT NOT NULL DEFAULT 'award',
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Unique constraint so a user does not get duplicate badge of the same key
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_badge ON public.achievements(user_id, badge_key);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- student_activities Policies
DROP POLICY IF EXISTS "Users can view their own activities or admins/faculty can view all" ON public.student_activities;
CREATE POLICY "Users can view their own activities or admins/faculty can view all"
    ON public.student_activities
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('faculty', 'organizer')
    );

DROP POLICY IF EXISTS "System and authenticated users can insert activities" ON public.student_activities;
CREATE POLICY "System and authenticated users can insert activities"
    ON public.student_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('faculty', 'organizer')
    );

-- achievements Policies
DROP POLICY IF EXISTS "Achievements are readable by all authenticated users" ON public.achievements;
CREATE POLICY "Achievements are readable by all authenticated users"
    ON public.achievements
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authorized roles can award achievements" ON public.achievements;
CREATE POLICY "Authorized roles can award achievements"
    ON public.achievements
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('faculty', 'organizer')
    );
