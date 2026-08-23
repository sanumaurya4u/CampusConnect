-- Migration: 007_seed_events.sql
-- Description: Seed initial campus events for UIET clubs.

DO $$
DECLARE
    v_admin_id UUID;
    v_ai_club_id UUID;
    v_debuggers_id UUID;
    v_pixel_id UUID;
    v_techtalk_id UUID;
BEGIN
    -- Get an organizer or admin profile to assign as created_by
    SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;

    -- Get Club IDs
    SELECT id INTO v_ai_club_id FROM public.clubs WHERE slug = 'ai-club';
    SELECT id INTO v_debuggers_id FROM public.clubs WHERE slug = 'the-debuggers';
    SELECT id INTO v_pixel_id FROM public.clubs WHERE slug = 'pixel-pioneers';
    SELECT id INTO v_techtalk_id FROM public.clubs WHERE slug = 'techtalk';

    -- 1. AI Club Event
    IF v_ai_club_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.events (
            club_id,
            title,
            description,
            category,
            event_type,
            venue,
            start_time,
            end_time,
            registration_deadline,
            max_capacity,
            tags,
            status,
            created_by
        ) VALUES (
            v_ai_club_id,
            'Generative AI & LLM Hands-on Workshop',
            'Deep dive into modern Foundation Models, Prompt Engineering, Retrieval-Augmented Generation (RAG), and building AI agents using Python and PyTorch. Laptops required.',
            'AI & Data Science',
            'workshop',
            'UIET Lab 3, CSE Block',
            NOW() + INTERVAL '5 days',
            NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
            NOW() + INTERVAL '4 days',
            60,
            ARRAY['AI', 'Generative AI', 'Python', 'Machine Learning'],
            'published',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- 2. The Debuggers Event
    IF v_debuggers_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.events (
            club_id,
            title,
            description,
            category,
            event_type,
            venue,
            start_time,
            end_time,
            registration_deadline,
            max_capacity,
            tags,
            status,
            created_by
        ) VALUES (
            v_debuggers_id,
            'Code Clash 2026: Campus DSA Hackathon',
            'A 6-hour competitive coding challenge covering advanced Data Structures, dynamic programming, and algorithmic problem solving. Open to all branches and years.',
            'DSA & Coding',
            'hackathon',
            'UIET Computer Center & Online Arena',
            NOW() + INTERVAL '12 days',
            NOW() + INTERVAL '12 days' + INTERVAL '6 hours',
            NOW() + INTERVAL '11 days',
            120,
            ARRAY['DSA', 'Competitive Coding', 'Hackathon', 'Algorithms'],
            'published',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- 3. Pixel Pioneers Event
    IF v_pixel_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.events (
            club_id,
            title,
            description,
            category,
            event_type,
            venue,
            start_time,
            end_time,
            registration_deadline,
            max_capacity,
            tags,
            status,
            created_by
        ) VALUES (
            v_pixel_id,
            'UI/UX Design Sprint with Figma & Canva',
            'Hands-on design workshop covering design systems, wireframing, color psychology, modern UI patterns, and interactive prototyping.',
            'Design & Digital Content',
            'workshop',
            'UIET Innovation Lab 1',
            NOW() + INTERVAL '8 days',
            NOW() + INTERVAL '8 days' + INTERVAL '2 hours',
            NOW() + INTERVAL '7 days',
            45,
            ARRAY['Figma', 'UI/UX', 'Design', 'Prototyping'],
            'published',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- 4. TechTalk Event
    IF v_techtalk_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.events (
            club_id,
            title,
            description,
            category,
            event_type,
            venue,
            start_time,
            end_time,
            registration_deadline,
            max_capacity,
            tags,
            status,
            created_by
        ) VALUES (
            v_techtalk_id,
            'Campus to Corporate: Tech Interview Masterclass',
            'Comprehensive technical & HR interview preparation seminar with alumni guest speakers from top product companies. Learn resume building and live mock interviews.',
            'Career Preparation',
            'seminar',
            'UIET Main Auditorium',
            NOW() + INTERVAL '15 days',
            NOW() + INTERVAL '15 days' + INTERVAL '3 hours',
            NOW() + INTERVAL '14 days',
            200,
            ARRAY['Placements', 'Interviews', 'Career', 'Resume'],
            'published',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

END $$;
