-- ====================================================================
-- Phase 8: Institutional Administration & System Governance
-- Seed dedicated Admin Account & Configure Administrative RLS
-- ====================================================================

-- 1. Seed Institutional Administrator Account in auth.users & profiles
DO $$
DECLARE
    v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    -- Check if admin user already exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@uiet.mdu.ac.in') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_admin_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@uiet.mdu.ac.in',
            crypt('Password123!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Dr. Admin UIET","role":"admin"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    ELSE
        SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@uiet.mdu.ac.in';
    END IF;

    -- Upsert profile for admin
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        department,
        semester,
        bio,
        interests,
        created_at,
        updated_at
    ) VALUES (
        v_admin_id,
        'admin@uiet.mdu.ac.in',
        'Dr. Admin UIET',
        'admin',
        'Applied Sciences & Humanities',
        'Faculty / Administration',
        'Institutional Administrator for Campus Connect at UIET, MDU Rohtak.',
        '["Campus Governance", "Student Welfare", "Accreditation"]'::jsonb,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', full_name = 'Dr. Admin UIET', department = 'Applied Sciences & Humanities';

END $$;

-- 2. Enhanced RLS Policies for Profiles Governance
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid()
        OR public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        id = auth.uid()
        OR public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 3. Enhanced RLS Policies for Club Governance
DROP POLICY IF EXISTS "Admins can insert clubs" ON public.clubs;
CREATE POLICY "Admins can insert clubs"
    ON public.clubs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

DROP POLICY IF EXISTS "Admins can delete clubs" ON public.clubs;
CREATE POLICY "Admins can delete clubs"
    ON public.clubs
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
