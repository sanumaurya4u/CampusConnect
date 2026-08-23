import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Printer,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useDocumentTitle } from '@/hooks'
import { passportService } from '@/services/passport.service'
import {
  PassportCard,
  BadgeGrid,
  ActivityTimeline,
  SkillsCloud,
} from '@/components/passport'
import { Button, LoadingSpinner } from '@/components/ui'
import type {
  StudentActivity,
  StudentAchievement,
  PassportSummary,
} from '@/types'

export function ActivityPassportPage() {
  useDocumentTitle('Activity Passport & Verified Portfolio')
  const { user, profile } = useAuth()
  const [activities, setActivities] = useState<StudentActivity[]>([])
  const [achievements, setAchievements] = useState<StudentAchievement[]>([])
  const [summary, setSummary] = useState<PassportSummary>({
    totalClubs: 0,
    eventsAttended: 0,
    projectsContributed: 0,
    totalCredits: 0,
    badgesEarned: 0,
    skillsLearned: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadPassportData = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      // Sync badges & activities first
      await passportService.syncAndEvaluateBadges(user.id)

      const [activitiesData, achievementsData, summaryData] = await Promise.all([
        passportService.getStudentActivities(user.id),
        passportService.getStudentAchievements(user.id),
        passportService.getPassportSummary(user.id),
      ])

      setActivities(activitiesData)
      setAchievements(achievementsData)
      setSummary(summaryData)
    } catch (err) {
      console.error('Failed to load Activity Passport:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadPassportData()
  }, [loadPassportData])

  const handlePrintPassport = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Verified Student Activity Passport..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 print:p-0 print:space-y-4">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] text-[#E05326] text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Extracurricular Accreditation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
            Student Activity <span className="text-[#E05326]">Passport.</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Official digital record of verified campus participation, leadership, and project credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPassport}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Export / Print Passport
          </Button>
          <Link to="/projects">
            <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Find More Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Digital Passport Identity Pass */}
      <PassportCard profile={profile} summary={summary} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Activity Timeline & Badges */}
        <div className="lg:col-span-2 space-y-8">
          {/* Milestone Badges Collection */}
          <BadgeGrid achievements={achievements} />

          {/* Chronological Activity Timeline */}
          <ActivityTimeline activities={activities} />
        </div>

        {/* Right Column: Skills Cloud & Verification Guarantee */}
        <div className="space-y-6">
          {/* Validated Skills Cloud */}
          <SkillsCloud skills={summary.skillsLearned} />

          {/* Institutional Accreditation Guarantee Card */}
          <div className="bg-[#181512] text-[#F9F6F0] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm border border-stone-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">University Verified Record</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              All extracurricular activities, workshop check-ins, and project contributions recorded in this Activity Passport are verified by official UIET student societies and faculty in-charges.
            </p>
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <span>UIET MDU Rohtak</span>
              <span>Ref: CC-PASS-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-xs text-stone-500 pt-8 border-t border-stone-300">
        <p className="font-bold text-stone-900">
          Campus Connect &bull; UIET, Maharshi Dayanand University, Rohtak
        </p>
        <p className="text-[10px] font-mono mt-1 text-stone-500">
          Generated from official campus activity records. Tamper-evident digital accreditation.
        </p>
      </div>
    </div>
  )
}
