-- Migration: 004_seed_uiet_clubs.sql
-- Description: Seed the 8 official UIET MDU Rohtak campus clubs from prototype specifications (privacy compliant).

INSERT INTO public.clubs (name, slug, description, objective, activities, category, faculty_incharge, coordinators, status)
VALUES
(
    'AI Club',
    'ai-club',
    'Introduces students to the rapidly evolving domains of Artificial Intelligence (AI), Data Science, and Data Analytics through hands-on workshops and projects.',
    'To introduce students to the rapidly evolving domains of Artificial Intelligence (AI), Data Science, and Data Analytics.',
    'The AI Club organizes seminars, hands-on workshops, and discussions to help students gain a strong foundation in AI concepts and analytical tools. It aims to foster innovative thinking and practical exposure to prepare members for future opportunities in AI-driven industries.',
    'AI & Data Science',
    'Dr. Kamaldeep',
    '[{"name": "Sakshi", "branch": "B.Tech CSE 7th Semester", "roll_no": "2214054"}, {"name": "Kusum", "branch": "B.Tech CSE 7th Semester", "roll_no": "2214026"}]'::jsonb,
    'active'
),
(
    'Pixel Pioneers',
    'pixel-pioneers',
    'Enhances creativity and digital design proficiency through Canva, Figma, Photoshop, MS Office, and Video Editing software.',
    'To enhance creativity and digital design proficiency among students.',
    'Pixel Pioneers focuses on practical learning through tools like Canva, Figma, Photoshop, MS Office, and Video Editing Software. The club encourages visual creativity and professional presentation skills, enabling students to design impactful academic and digital content.',
    'Design & Digital Content',
    'Dr. Yogesh',
    '[{"name": "Sagar Solanki", "branch": "B.Tech CSE 7th Semester", "roll_no": "2214035"}, {"name": "Tanishka Manocha", "branch": "B.Tech Biotech 5th Semester", "roll_no": "2312009"}]'::jsonb,
    'active'
),
(
    'The Debuggers',
    'the-debuggers',
    'Promotes coding excellence through Data Structures & Algorithms (DSA), competitive programming, and hackathons.',
    'To prepare students for professional growth, logical reasoning, and career opportunities in software development.',
    'The Debuggers Club promotes coding excellence through Data Structures & Algorithms (DSA), Coding Competitions, and Hackathons. It helps students develop logical reasoning, teamwork, and competitiveness, preparing them for real-world technical challenges and interviews.',
    'DSA & Coding',
    'Dr. Harkesh',
    '[{"name": "Satyam Sharma", "branch": "B.Tech CSE 7th Semester", "roll_no": "2214030"}, {"name": "Jatin Gupta", "branch": "B.Tech CSE 7th Semester", "roll_no": "2214036"}]'::jsonb,
    'active'
),
(
    'TechTalk',
    'techtalk',
    'Guides students in career readiness, interview preparation, resume building, LinkedIn optimization, and competitive exam awareness.',
    'To prepare students for professional growth, career opportunities, and competitive exams.',
    'TechTalk conducts sessions on Interview Preparation, Resume Building, LinkedIn Profile Optimization, and Exam Awareness. It guides students in exploring both private and government sector opportunities, helping them develop communication skills, confidence, and career readiness.',
    'Career Preparation',
    'Dr. Chhavi Rana',
    '[{"name": "Adil Ali", "branch": "B.Tech AIML 7th Semester", "roll_no": "2214027"}, {"name": "Nitika", "branch": "B.Tech AIML 7th Semester", "roll_no": "2211013"}, {"name": "Tamanna", "branch": "B.Tech AIML 7th Semester", "roll_no": "2211011"}]'::jsonb,
    'active'
),
(
    'Mathematics Club',
    'mathematics-club',
    'Fosters mathematical thinking, applied problem solving, robotics, and scientific curiosity among students.',
    'To prepare students for mathematical thinking, problem solving skills and to enhance interest and application of mathematics in real life.',
    'Promote the creation of focused student-led sub-clubs in emerging and high-impact areas of science and technology, such as coding, robotics and more. To encourage critical thinking, curiosity, and a scientific mindset among students. Also, host mathematics quizzes and model exhibitions.',
    'Mathematics',
    'Dr. Vikas Kumar',
    '[{"name": "Mr. Salook Sharma", "branch": "Research Scholar"}, {"name": "Ms. Anjali", "branch": "Research Scholar"}]'::jsonb,
    'active'
),
(
    'Wellness Vibe Club',
    'wellness-vibe',
    'Integrates mental health, resilience-building, yoga, mindfulness, and games into university life for balanced growth.',
    'To prepare students for better mental health by doing activities like games, yoga and other mindful wellness practices.',
    'To establish structured programs that integrate mental health, resilience-building, and happiness research into university life. Offer them spaces for self-reflection, and intentional behavior cultivation. Also to integrate Indian knowledge systems with modern psychology by blending mindfulness, yoga, and ancient wisdom traditions with evidence-based psychological approaches.',
    'Wellness',
    'Mr. Sumit Mor',
    '[{"name": "Gurmukh", "branch": "B.Tech EE 3rd Semester"}, {"name": "Jagriti", "branch": "B.Tech EE 3rd Semester"}]'::jsonb,
    'active'
),
(
    'Genzyme Hub Club',
    'genzyme-hub',
    'A platform for students to showcase research ideas, biotechnology innovations, and interact with industry experts.',
    'To prepare students for professional growth, career opportunities, and innovation development.',
    'Provide platform for students to showcase talent, research ideas, and innovative projects. To facilitate interactions with industry experts and lab assistants for guidance and research opportunities.',
    'Innovation & Projects',
    'Dr. Manjeet Kaur',
    '[{"name": "Aakarshak Thakur", "branch": "Student Lead"}, {"name": "Gitansh Dubey", "branch": "Student Lead"}, {"name": "Tanishka Manocha", "branch": "Student Lead"}, {"name": "Sneh Deswal", "branch": "Student Lead"}]'::jsonb,
    'active'
),
(
    'Oratory Club',
    'oratory-club',
    'Engages students in debates, discussions, public speaking, and articulation of ideas to develop self-confidence and leadership.',
    'To prepare students for communication, public speaking skills, and career opportunities.',
    'Engage students in discussions and debates on various topics to enhance self-confidence and develop leadership quality. To enhance communication skills and public speaking skills. To promote articulation of ideas effectively thereby enhancing interpretative skills.',
    'Public Speaking & Debates',
    'Dr. Chanchal Hooda',
    '[{"name": "Kunal Verma", "branch": "B.Tech CSE 3rd Semester"}, {"name": "Yashi Mahendra", "branch": "B.Tech Biotech 5th Semester"}]'::jsonb,
    'active'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    objective = EXCLUDED.objective,
    activities = EXCLUDED.activities,
    category = EXCLUDED.category,
    faculty_incharge = EXCLUDED.faculty_incharge,
    coordinators = EXCLUDED.coordinators,
    status = EXCLUDED.status,
    updated_at = NOW();
