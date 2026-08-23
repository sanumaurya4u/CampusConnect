import { Award, ShieldCheck, GraduationCap, School } from 'lucide-react'
import type { Profile, PassportSummary } from '@/types'
import { getInitials } from '@/lib/utils'

interface PassportCardProps {
  profile: Profile | null
  summary: PassportSummary
}

export function PassportCard({ profile, summary }: PassportCardProps) {
  const initials = getInitials(profile?.full_name || 'UIET Student')
  const studentName = profile?.full_name || 'UIET Student'
  const department = profile?.department || 'Computer Science & Engineering'
  const semester = profile?.semester || '1st Semester'
  const email = profile?.email || 'student@uiet.mdu.ac.in'

  return (
    <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl border border-stone-800 shadow-xl overflow-hidden relative">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#E05326]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-stone-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="p-6 sm:p-8 space-y-6 relative z-10">
        {/* Top Accreditation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-stone-800 flex items-center justify-center text-[#E05326] border border-stone-700">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#E05326] font-mono font-bold">
                UIET &bull; Maharshi Dayanand University
              </p>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Digital Student Activity Passport
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Campus Credential</span>
            </div>
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#292420] text-[#E05326] font-bold text-xl flex items-center justify-center shadow-inner border border-stone-700 shrink-0">
              {initials}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{studentName}</h3>
              <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#E05326] shrink-0" />
                <span>
                  {department} &bull; {semester}
                </span>
              </p>
              <p className="text-xs text-stone-400 font-mono">{email}</p>
            </div>
          </div>

          {/* Activity Credit Seal */}
          <div className="bg-[#241F1A] border border-stone-700 rounded-2xl p-4 sm:p-5 text-center min-w-[140px] shrink-0">
            <p className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wider">
              Activity Score
            </p>
            <p className="text-3xl font-extrabold text-[#E05326] mt-1 flex items-center justify-center gap-1">
              <Award className="h-6 w-6 text-amber-400" />
              <span>{summary.totalCredits}</span>
            </p>
            <p className="text-[10px] font-mono text-stone-400 mt-0.5">Verified Credits Earned</p>
          </div>
        </div>

        {/* Metric Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-stone-800">
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
            <p className="text-[10px] font-mono uppercase text-stone-400">Clubs Joined</p>
            <p className="text-lg font-bold text-white mt-0.5">{summary.totalClubs}</p>
          </div>
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
            <p className="text-[10px] font-mono uppercase text-stone-400">Events Attended</p>
            <p className="text-lg font-bold text-white mt-0.5">{summary.eventsAttended}</p>
          </div>
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
            <p className="text-[10px] font-mono uppercase text-stone-400">Project Roles</p>
            <p className="text-lg font-bold text-white mt-0.5">{summary.projectsContributed}</p>
          </div>
          <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800">
            <p className="text-[10px] font-mono uppercase text-stone-400">Badges Earned</p>
            <p className="text-lg font-bold text-[#E05326] mt-0.5">{summary.badgesEarned}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
