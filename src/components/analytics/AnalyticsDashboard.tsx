import { useState, useEffect, useCallback } from 'react'
import {
  BarChart2,
  Printer,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import {
  analyticsService,
  type InstitutionalAnalyticsData,
} from '@/services/analytics.service'
import { Card, CardHeader, CardBody, Badge, Button, LoadingSpinner } from '@/components/ui'

export function AnalyticsDashboard() {
  const [data, setData] = useState<InstitutionalAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await analyticsService.getInstitutionalAnalytics()
      setData(res)
    } catch (err) {
      console.error('Failed to load institutional analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const handlePrintAudit = () => {
    window.print()
  }

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center">
        <LoadingSpinner size="lg" label="Computing University Accreditation & Analytics Data..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-primary text-xs font-semibold border border-indigo-100 mb-1.5">
            <BarChart2 className="h-3.5 w-3.5" />
            <span>NAAC &amp; NBA Co-Curricular Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            University Engagement &amp; Accreditation Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Aggregated institutional participation statistics, society productivity indices, and student accreditation metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrintAudit}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Export NAAC Audit
          </Button>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Attendance Conversion
            </p>
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {data.attendanceConversionRate}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.totalAttended} of {data.totalRegistrations} verified attendees
          </p>
        </Card>

        <Card className="p-5 border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Student Activity Hours
            </p>
            <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            ~{data.naacSummary.totalStudentHours} hrs
          </p>
          <p className="mt-1 text-xs text-gray-500">Verified co-curricular output</p>
        </Card>

        <Card className="p-5 border-amber-100 bg-gradient-to-br from-amber-50/50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Total Activity Credits
            </p>
            <div className="h-8 w-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {data.totalCreditsAwarded}
          </p>
          <p className="mt-1 text-xs text-gray-500">Passport accreditation points</p>
        </Card>

        <Card className="p-5 border-cyan-100 bg-gradient-to-br from-cyan-50/50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
              Active Engagement
            </p>
            <div className="h-8 w-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">
            {data.naacSummary.activeStudentEngagementRate}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Of enrolled campus student body</p>
        </Card>
      </div>

      {/* Two Column Section: Category Heatmap + Passport Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Engagement Distribution */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Co-Curricular Domain Distribution
              </h3>
              <p className="text-xs text-gray-500">
                Activity volume by engineering and creative discipline.
              </p>
            </div>
            <Badge variant="primary" className="text-xs">
              8 Disciplines
            </Badge>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            {data.categoryMetrics.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-800">{cat.category}</span>
                  <span className="text-primary font-bold">{cat.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Passport Accreditation Tier Distribution */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Activity Passport Accreditation Brackets
              </h3>
              <p className="text-xs text-gray-500">
                Student distribution across certified co-curricular credit levels.
              </p>
            </div>
            <Badge variant="success" className="text-xs">
              Accredited Tiers
            </Badge>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            {data.tierDistribution.map((tier, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{tier.tier}</p>
                  <p className="text-xs text-gray-500">
                    {tier.studentCount} Certified UIET Learners
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-primary">{tier.percentage}%</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Society Productivity Ranking Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Official Society Productivity &amp; Output Index
            </h3>
            <p className="text-xs text-gray-500">
              Composite score: Active Members (x2) + Workshops Held (x10) + Projects (x15) + Inter-Club Collaborations (x8).
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Rank &amp; Society</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Members</th>
                  <th className="px-6 py-3">Events</th>
                  <th className="px-6 py-3">Projects</th>
                  <th className="px-6 py-3">Collaborations</th>
                  <th className="px-6 py-3 text-right">Productivity Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.clubProductivityList.map((club, index) => (
                  <tr key={club.clubId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        {club.clubName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-primary">
                      {club.category}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-800">
                      {club.membersCount}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondary">
                      {club.eventsCount}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-600">
                      {club.projectsCount}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-indigo-600">
                      {club.collaborationsCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="primary" className="text-xs font-bold px-2.5 py-1">
                        {club.productivityScore} pts
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Institutional Compliance Seal Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Institutional Compliance &amp; NAAC Verification</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            All records, attendee check-ins, and project contributions are cryptographically verified through organizer sign-offs and tamper-evident student activity logs at UIET MDU Rohtak.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handlePrintAudit}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shrink-0"
        >
          Print Official Report
        </Button>
      </Card>
    </div>
  )
}
