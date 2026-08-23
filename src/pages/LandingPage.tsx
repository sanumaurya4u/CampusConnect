import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Award,
  Clock,
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'

export function LandingPage() {
  useDocumentTitle('Campus Life & Student Societies')
  const [activeStep, setActiveStep] = useState<number>(1)

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* 1. HERO SECTION WITH EDITORIAL TYPOGRAPHY & INTERACTIVE WINDOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] text-[#E05326] text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>UIET MDU Rohtak &bull; Campus Platform</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.08]">
              Discover. <br />
              Participate. <br />
              <span className="text-[#E05326]">Collaborate.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-600 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              One centralized home for student clubs, live hackathons, technical workshops, and cross-society projects across UIET engineering departments.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Join Campus Connect
                </Button>
              </Link>
              <Link to="/clubs">
                <Button variant="secondary" size="lg">
                  Explore Societies
                </Button>
              </Link>
            </div>

            {/* Quick Topic Chips */}
            <div className="pt-3 flex items-center gap-2 flex-wrap text-xs text-stone-500">
              <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400 font-semibold">Tracks:</span>
              {['AI & Machine Learning', 'DSA & Hackathons', 'UI/UX Design', 'Robotics & IoT', 'Activity Passport'].map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full bg-[#F0EBE1] text-stone-700 text-xs font-medium border border-[#E2DAD0] hover:border-stone-400 transition-colors"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Right Interactive Mock Terminal / Activity Window */}
          <div className="lg:col-span-5">
            <div className="bg-[#FDFCFA] rounded-2xl border border-[#E5DFD5] shadow-[0_8px_32px_rgba(28,25,23,0.06)] p-6 sm:p-7 space-y-6 relative overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 font-mono text-[11px] text-stone-400 uppercase tracking-wider">campus-activity · live</span>
                </div>
                <Badge variant="live" className="text-[10px]">
                  LIVE · 8 CLUBS
                </Badge>
              </div>

              {/* Interactive Step Switcher */}
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">Campus Pipeline</p>
                <div className="grid grid-cols-3 gap-1.5 bg-[#EFE9DF]/80 p-1 rounded-full border border-[#E2DAD0]">
                  {[
                    { id: 1, label: '1. Discover' },
                    { id: 2, label: '2. Register' },
                    { id: 3, label: '3. Passport' },
                  ].map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`py-1.5 px-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        activeStep === step.id
                          ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Step Content Card */}
              {activeStep === 1 && (
                <div className="p-4 rounded-xl bg-[#F7F2E8] border border-[#E5DFD5] space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">AI Club &bull; The Debuggers</span>
                    <span className="text-xs font-mono text-[#E05326] font-bold">98% Match</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Personalized society suggestions matched to your CSE/AIML branch, technical goals, and career interests.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white text-[11px] font-mono text-stone-700 border border-stone-200">
                      150+ Members
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white text-[11px] font-mono text-stone-700 border border-stone-200">
                      Weekly Sessions
                    </span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="p-4 rounded-xl bg-[#F7F2E8] border border-[#E5DFD5] space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Generative AI & LLMs Workshop</span>
                    <span className="text-xs font-mono text-emerald-700 font-bold">Registered</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Instant 1-click registration with digital QR passes and real-time venue check-in verification.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs text-stone-500 font-mono">
                    <Clock className="h-3.5 w-3.5 text-[#E05326]" />
                    <span>Seminar Hall &bull; 4:00 PM</span>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="p-4 rounded-xl bg-[#F7F2E8] border border-[#E5DFD5] space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Digital Activity Passport</span>
                    <span className="text-xs font-mono text-amber-700 font-bold">Gold Tier</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Verified co-curricular transcripts certifying workshop hours, hackathon placements, and student leadership.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs text-stone-700 font-bold">
                    <Award className="h-4 w-4 text-[#E05326]" />
                    <span>10 Verified Activity Credits</span>
                  </div>
                </div>
              )}

              {/* Bottom Quick Metric Bar */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-[#EFE9DF]">
                <div>
                  <p className="text-lg font-extrabold text-stone-900">8</p>
                  <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Societies</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#E05326]">100%</p>
                  <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Free Access</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-stone-900">NAAC</p>
                  <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Accredited</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PICK A TRACK / SOCIETIES GRID (Like Reference Screenshot) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Explore Campus Societies
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl font-normal">
            UIET student clubs organized across engineering and creative disciplines. Jump straight in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: AI & Data Science */}
          <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">
                    AI Club
                  </h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Artificial Intelligence & Data Science</p>
                </div>
                <Badge variant="live" className="text-[10px]">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Hands-on bootcamps, prompt engineering, neural architectures, and real-world ML project incubators at UIET.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Machine Learning', 'Deep Learning', 'PyTorch', 'LLMs & NLP', 'Kaggle'].map((tag) => (
                  <span key={tag} className="editorial-tag text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>150+ Members &bull; 4 Workshops</span>
              <Link to="/clubs/ai-club" className="font-semibold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 transition-colors">
                <span>Enter</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: The Debuggers */}
          <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">
                    The Debuggers
                  </h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Competitive Programming &amp; DSA</p>
                </div>
                <Badge variant="accent" className="text-[10px] uppercase font-mono font-bold">
                  HACKATHONS
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Algorithmic problem solving, LeetCode sprints, campus code clash hackathons, and placement interview prep.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Dynamic Programming', 'Graph Theory', 'C++', 'Java', 'Speed Coding'].map((tag) => (
                  <span key={tag} className="editorial-tag text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>180+ Members &bull; Code Clash 2026</span>
              <Link to="/clubs/the-debuggers" className="font-semibold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 transition-colors">
                <span>Enter</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Pixel Pioneers */}
          <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">
                    Pixel Pioneers
                  </h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Design, UI/UX &amp; Digital Content</p>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                  CREATIVE
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Crafting interfaces, digital media, 3D animations, brand identities, and visual assets for college initiatives.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Figma', 'UI/UX Design', '3D Blender', 'Motion Graphics', 'Typography'].map((tag) => (
                  <span key={tag} className="editorial-tag text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>120+ Members &bull; 5 Design Sprints</span>
              <Link to="/clubs/pixel-pioneers" className="font-semibold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 transition-colors">
                <span>Enter</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 4: TechTalk & Career Prep */}
          <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">
                    TechTalk Club
                  </h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Career Prep, Mock Interviews &amp; Talks</p>
                </div>
                <Badge variant="success" className="text-[10px] font-mono font-bold">
                  CAREERS
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Alumni guest lectures, resume reviews, technical mock interviews, and group discussion masterclasses.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Mock Interviews', 'Resume Teardown', 'System Design', 'HR Rounds', 'Alumni Mentorship'].map((tag) => (
                  <span key={tag} className="editorial-tag text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>95+ Members &bull; Placement Series</span>
              <Link to="/clubs/techtalk" className="font-semibold text-stone-900 group-hover:text-[#E05326] flex items-center gap-1 transition-colors">
                <span>Enter</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL SPLIT: "NEVER STOP AT THE CLASSROOM DOOR" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#F4EFE6] border border-[#E5DFD5] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4 text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-[#E05326] font-bold">
              THE STUDENT LIFECYCLE &bull; CO-CURRICULAR OUTPUT
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Never stop at the <span className="text-[#E05326]">classroom door.</span>
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Engineering is learned by building. Discover real campus projects, join cross-society teams, collaborate with peers across branches, and build a verified portfolio that proves your capabilities to employers.
            </p>
            <div className="pt-2">
              <Link to="/projects">
                <Button size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Explore Campus Projects
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FDFCFA] rounded-2xl border border-[#E5DFD5] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-3">
              <span className="text-xs font-bold text-stone-900">Featured Open Recruitment</span>
              <span className="text-[10px] font-mono text-[#E05326] font-bold">RECRUITING</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-stone-900">UIET Campus AI Assistant &amp; Query Bot</p>
                <p className="text-xs text-stone-500">By AI Club &bull; 3 Open Positions</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['React 19', 'TypeScript', 'Tailwind CSS', 'Supabase', 'NLP'].map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[10px] font-mono text-stone-700">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/projects" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Apply for Project Roles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. DARK ESPRESSO HIGHLIGHT: ACTIVITY PASSPORT (Like Dark Mode Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl p-8 sm:p-14 border border-stone-800 shadow-xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 text-[#E05326] text-xs font-mono font-bold tracking-wider uppercase border border-stone-700">
                <span>NEW &bull; ACTIVITY PASSPORT 2026</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                A verified record for the skills you <span className="text-[#E05326]">actually earn.</span>
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Every workshop attended, contest solved, and leadership role undertaken is recorded in your tamper-evident Digital Activity Passport — complete with NAAC &amp; NBA accreditation points.
              </p>
              <div className="pt-2 flex items-center gap-4 flex-wrap">
                <Link to="/passport">
                  <Button
                    size="lg"
                    className="!bg-white !text-[#181512] hover:!bg-stone-200 !border-white font-bold"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Your Passport
                  </Button>
                </Link>
                <Link to="/events">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-stone-300 hover:text-white hover:bg-stone-800 border-stone-700"
                  >
                    Upcoming Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mock Passport ID Badge */}
            <div className="lg:col-span-5 bg-[#221E1A] rounded-2xl border border-stone-700 p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#E05326]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-200">Digital Passport ID</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#E05326]/20 text-[#E05326] text-[10px] font-mono font-bold border border-[#E05326]/40">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono uppercase text-stone-400">Accredited Learner</p>
                <p className="text-base font-bold text-white">UIET Campus Scholar</p>
                <p className="text-xs text-stone-400">Computer Science &amp; Engineering &bull; 6th Semester</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-left">
                  <p className="text-[10px] font-mono uppercase text-stone-400">Accreditation</p>
                  <p className="text-sm font-bold text-[#E05326]">Gold Tier</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-left">
                  <p className="text-[10px] font-mono uppercase text-stone-400">Activity Credits</p>
                  <p className="text-sm font-bold text-emerald-400">10 Pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
