import { Link } from 'react-router-dom'
import { GraduationCap, Eye, FileText, BarChart3, ArrowRight } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Badge } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'

export function FacultyDashboard() {
  const { profile } = useAuth()
  const name = profile?.full_name || 'Faculty Member'
  useDocumentTitle('Faculty Supervision Workspace')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Faculty Header */}
      <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E05326]/20 border border-[#E05326]/40 text-[#E05326] text-xs font-mono font-bold tracking-wider uppercase">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Faculty Supervision Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Welcome, {name}</h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Supervise assigned UIET student clubs, monitor student participation, and review club activity reports.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Badge variant="live" className="text-[10px]">
            TEACHER IN-CHARGE ACCESS
          </Badge>
        </div>
      </div>

      {/* Supervisory Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="editorial-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <Eye className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Assigned Societies</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Oversee objectives, student coordinators, and annual plans for your clubs.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#E05326] uppercase">Active Society Oversight</span>
        </div>

        <div className="editorial-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <FileText className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Event Supervision</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Review upcoming workshops, guest lectures, and student attendance logs.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#E05326] uppercase">Attendance Verification</span>
        </div>

        <div className="editorial-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-[#EFE9DF] rounded-xl flex items-center justify-center text-stone-900 border border-[#E2DAD0]">
              <BarChart3 className="h-5 w-5 text-[#E05326]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Accreditation Output</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Generate and review verified student engagement and activity summaries.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#E05326] uppercase">NAAC Criteria 5</span>
        </div>
      </div>

      {/* Faculty Profile Summary */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-4">
          <h2 className="text-base font-bold text-stone-900">Faculty Supervisor Credentials</h2>
          <Link to="/profile" className="text-xs text-stone-900 hover:text-[#E05326] flex items-center gap-1 font-bold font-mono transition-colors">
            <span>Manage Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F7F2E8]/60 rounded-xl border border-[#E5DFD5]">
            <p className="text-[10px] text-stone-400 uppercase">Supervisor Name</p>
            <p className="font-bold text-stone-900 text-sm mt-0.5">{profile?.full_name}</p>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-xl border border-[#E5DFD5]">
            <p className="text-[10px] text-stone-400 uppercase">Department</p>
            <p className="font-bold text-stone-900 text-sm mt-0.5">{profile?.department || 'Applied Sciences / Engineering'}</p>
          </div>
          <div className="p-3 bg-[#F7F2E8]/60 rounded-xl border border-[#E5DFD5]">
            <p className="text-[10px] text-stone-400 uppercase">Role Designation</p>
            <p className="font-bold text-[#E05326] text-sm mt-0.5">Faculty In-Charge</p>
          </div>
        </div>
      </div>
    </div>
  )
}
