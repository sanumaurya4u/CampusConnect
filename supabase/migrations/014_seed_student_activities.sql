-- ====================================================================
-- Phase 7: Seed Verified Student Activities & Badges for Demo Student
-- ====================================================================

DO $$
DECLARE
    v_student_id UUID;
    v_ai_club_id UUID;
    v_event_id UUID;
    v_project_id UUID;
BEGIN
    -- Get student Aman Kumar ID
    SELECT id INTO v_student_id FROM public.profiles WHERE email = 'aman.student@uiet.mdu.ac.in';
    
    -- Get AI Club ID
    SELECT id INTO v_ai_club_id FROM public.clubs WHERE slug = 'ai-club';

    -- Get Generative AI event ID
    SELECT id INTO v_event_id FROM public.events WHERE title LIKE '%Generative AI%' LIMIT 1;

    -- Get AI Assistant project ID
    SELECT id INTO v_project_id FROM public.projects WHERE title LIKE '%AI Assistant%' LIMIT 1;

    IF v_student_id IS NOT NULL THEN
        -- 1. Seed Club Membership Activity
        IF v_ai_club_id IS NOT NULL THEN
            INSERT INTO public.student_activities (user_id, activity_type, reference_id, title, metadata, occurred_at)
            VALUES (
                v_student_id,
                'club',
                v_ai_club_id,
                'Joined AI Club',
                jsonb_build_object(
                    'club_name', 'AI Club',
                    'category', 'AI & Data Science',
                    'role', 'member',
                    'credits', 2
                ),
                now() - INTERVAL '10 days'
            )
            ON CONFLICT DO NOTHING;
        END IF;

        -- 2. Seed Event Attendance Activity
        IF v_event_id IS NOT NULL THEN
            INSERT INTO public.student_activities (user_id, activity_type, reference_id, title, metadata, occurred_at)
            VALUES (
                v_student_id,
                'event',
                v_event_id,
                'Attended Hands-on Workshop: Generative AI & Prompt Engineering',
                jsonb_build_object(
                    'event_title', 'Hands-on Workshop: Generative AI & Prompt Engineering',
                    'club_name', 'AI Club',
                    'venue', 'UIET Lab 3, CSE Block',
                    'event_type', 'workshop',
                    'credits', 3,
                    'verified_attendance', true
                ),
                now() - INTERVAL '3 days'
            )
            ON CONFLICT DO NOTHING;
        END IF;

        -- 3. Seed Project Contribution Activity
        IF v_project_id IS NOT NULL THEN
            INSERT INTO public.student_activities (user_id, activity_type, reference_id, title, metadata, occurred_at)
            VALUES (
                v_student_id,
                'project',
                v_project_id,
                'Recruited as LLM / NLP Engineer for UIET Campus AI Assistant & Query Bot',
                jsonb_build_object(
                    'project_title', 'UIET Campus AI Assistant & Query Bot',
                    'club_name', 'AI Club',
                    'role_applied', 'LLM / NLP Engineer',
                    'skills', jsonb_build_array('Python', 'LangChain', 'PyTorch', 'FastAPI'),
                    'credits', 5,
                    'status', 'approved'
                ),
                now() - INTERVAL '1 day'
            )
            ON CONFLICT DO NOTHING;
        END IF;

        -- 4. Seed Milestone Badges
        INSERT INTO public.achievements (user_id, title, description, achievement_type, badge_key, badge_icon, awarded_at, metadata)
        VALUES
        (
            v_student_id,
            'Pioneer Club Member',
            'Joined an official UIET student society to foster collaborative campus innovation.',
            'milestone',
            'club_pioneer',
            'sparkles',
            now() - INTERVAL '10 days',
            jsonb_build_object('club_name', 'AI Club')
        ),
        (
            v_student_id,
            'Campus Workshop Enthusiast',
            'Successfully completed verified attendance check-in at a technical hands-on workshop.',
            'event',
            'event_enthusiast',
            'calendar',
            now() - INTERVAL '3 days',
            jsonb_build_object('events_count', 1)
        ),
        (
            v_student_id,
            'Master Project Contributor',
            'Earned an approved contributor position on an official UIET campus development project.',
            'project',
            'project_builder',
            'code',
            now() - INTERVAL '1 day',
            jsonb_build_object('role', 'LLM / NLP Engineer', 'project', 'UIET Campus AI Assistant')
        )
        ON CONFLICT (user_id, badge_key) DO UPDATE
        SET title = EXCLUDED.title, description = EXCLUDED.description;

    END IF;
END $$;
