-- Migration: 009_seed_collaborations.sql
-- Description: Seed initial campus cross-club collaborations for UIET clubs.

DO $$
DECLARE
    v_admin_id UUID;
    v_ai_club_id UUID;
    v_debuggers_id UUID;
    v_pixel_id UUID;
    v_oratory_id UUID;
    v_event_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;

    SELECT id INTO v_ai_club_id FROM public.clubs WHERE slug = 'ai-club';
    SELECT id INTO v_debuggers_id FROM public.clubs WHERE slug = 'the-debuggers';
    SELECT id INTO v_pixel_id FROM public.clubs WHERE slug = 'pixel-pioneers';
    SELECT id INTO v_oratory_id FROM public.clubs WHERE slug = 'oratory-club';

    SELECT id INTO v_event_id FROM public.events WHERE title LIKE '%Code Clash%' LIMIT 1;

    -- 1. AI Club + The Debuggers (Accepted Collaboration)
    IF v_ai_club_id IS NOT NULL AND v_debuggers_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.club_collaborations (
            initiator_club_id,
            target_club_id,
            event_id,
            title,
            description,
            proposed_dates,
            status,
            initiator_notes,
            target_response,
            created_by
        ) VALUES (
            v_ai_club_id,
            v_debuggers_id,
            v_event_id,
            'Campus HackAI 2026: Inter-Society AI & Algorithmic Hackathon',
            'Joint technical hackathon bridging algorithmic problem-solving with Machine Learning pipelines and Foundation Models.',
            'Mid Semester 2026',
            'accepted',
            'Let us combine our strengths to host UIET’s largest joint hackathon of the semester.',
            'The Debuggers core team is excited to co-host! We will organize the algorithmic round.',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- 2. Pixel Pioneers + Oratory Club (Pending Proposal)
    IF v_pixel_id IS NOT NULL AND v_oratory_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
        INSERT INTO public.club_collaborations (
            initiator_club_id,
            target_club_id,
            title,
            description,
            proposed_dates,
            status,
            initiator_notes,
            created_by
        ) VALUES (
            v_pixel_id,
            v_oratory_id,
            'Design & Pitch: Campus Media & Debate Bootcamp',
            'A 2-day combined bootcamp where students learn presentation visual design on Day 1 (Pixel Pioneers) and public speaking & pitch articulation on Day 2 (Oratory Club).',
            'Upcoming Month',
            'pending',
            'Combining visual slides design with pitch delivery will offer immense value to students.',
            v_admin_id
        ) ON CONFLICT DO NOTHING;
    END IF;

END $$;
