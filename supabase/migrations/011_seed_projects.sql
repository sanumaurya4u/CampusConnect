-- Migration: 011_seed_projects.sql
-- Description: Seed initial campus open-source & technical development projects for UIET clubs.

DO $$
DECLARE
    v_admin_id UUID;
    v_ai_club_id UUID;
    v_debuggers_id UUID;
    v_pixel_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;

    SELECT id INTO v_ai_club_id FROM public.clubs WHERE slug = 'ai-club';
    SELECT id INTO v_debuggers_id FROM public.clubs WHERE slug = 'the-debuggers';
    SELECT id INTO v_pixel_id FROM public.clubs WHERE slug = 'pixel-pioneers';

    -- 1. AI Club Project: Campus AI Assistant & Query Bot
    IF v_ai_club_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.projects (
            club_id,
            title,
            description,
            category,
            status,
            open_roles,
            tech_stack,
            github_url,
            demo_url,
            created_by
        ) VALUES (
            v_ai_club_id,
            'UIET Campus AI Assistant & Query Bot',
            'An intelligent conversational agent trained on UIET academic syllabi, department notices, club schedules, and campus guidelines to answer student queries in real-time.',
            'AI & Data Science',
            'open',
            '[
                {"role": "LLM / NLP Engineer", "slots": 2, "filled": 0, "skills": ["Python", "LangChain", "PyTorch", "HuggingFace"]},
                {"role": "FullStack React Developer", "slots": 2, "filled": 0, "skills": ["React", "TypeScript", "Tailwind CSS", "Vite"]},
                {"role": "Campus Data Curator", "slots": 1, "filled": 0, "skills": ["Markdown", "Data Scrubbing", "Information Architecture"]}
            ]'::jsonb,
            ARRAY['Python', 'FastAPI', 'React', 'TypeScript', 'LangChain', 'Supabase'],
            'https://github.com/uiet-ai-club/campus-ai-assistant',
            'https://ai-bot.uiet.mdu.ac.in',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- 2. The Debuggers Project: Campus Code Arena
    IF v_debuggers_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.projects (
            club_id,
            title,
            description,
            category,
            status,
            open_roles,
            tech_stack,
            github_url,
            demo_url,
            created_by
        ) VALUES (
            v_debuggers_id,
            'Campus Code Arena: Real-Time Coding Contest Platform',
            'An interactive online judge and contest platform designed for hosting intra-college coding competitions, speed debugging rounds, and DSA practice problems.',
            'DSA & Coding',
            'open',
            '[
                {"role": "Backend Go / Node Engineer", "slots": 2, "filled": 0, "skills": ["Node.js", "Go", "Docker", "Redis"]},
                {"role": "Frontend Contest UI Lead", "slots": 1, "filled": 0, "skills": ["React", "Monaco Editor", "WebSockets"]}
            ]'::jsonb,
            ARRAY['Node.js', 'Go', 'Docker', 'Redis', 'React', 'Tailwind CSS'],
            'https://github.com/uiet-debuggers/code-arena',
            NULL,
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- 3. Pixel Pioneers Project: UIET Design System & Student Portal
    IF v_pixel_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.projects (
            club_id,
            title,
            description,
            category,
            status,
            open_roles,
            tech_stack,
            github_url,
            demo_url,
            created_by
        ) VALUES (
            v_pixel_id,
            'UIET Design System & Student Showcase Portal',
            'A unified open design system with typography, accessible components, and a public gallery showcasing creative work, posters, UI concepts, and 3D renders from UIET students.',
            'Design & Digital Content',
            'open',
            '[
                {"role": "UI/UX Product Designer", "slots": 2, "filled": 0, "skills": ["Figma", "Design Systems", "Wireframing"]},
                {"role": "Motion Graphics Designer", "slots": 1, "filled": 0, "skills": ["After Effects", "Lottie", "Canva"]}
            ]'::jsonb,
            ARRAY['Figma', 'React', 'Tailwind CSS', 'Framer Motion', 'Lottie'],
            'https://github.com/pixel-pioneers/uiet-design-system',
            NULL,
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

END $$;
