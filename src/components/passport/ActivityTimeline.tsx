import { useState } from 'react'
import {
  Calendar,
  FolderGit2,
  Users,
  Award,
  Crown,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardBody, Badge, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { StudentActivity, ActivityType } from '@/types'

interface ActivityTimelineProps {
  activities: StudentActivity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  const filteredActivities = activities.filter((act) => {
    if (selectedFilter === 'all') return true
    return act.activity_type === selectedFilter
  })

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4 text-stone-700" />
      case 'project':
        return <FolderGit2 className="h-4 w-4 text-[#E05326]" />
      case 'club':
        return <Users className="h-4 w-4 text-stone-800" />
      case 'leadership':
        return <Crown className="h-4 w-4 text-amber-600" />
      case 'achievement':
        return <Award className="h-4 w-4 text-[#E05326]" />
      default:
        return <Sparkles className="h-4 w-4 text-stone-500" />
    }
  }

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'event':
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono font-bold">Event</Badge>
      case 'project':
        return <Badge variant="accent" className="text-[10px] uppercase font-mono font-bold">Project</Badge>
      case 'club':
        return <Badge variant="primary" className="text-[10px] uppercase font-mono font-bold">Club</Badge>
      case 'leadership':
        return <Badge variant="warning" className="text-[10px] uppercase font-mono font-bold">Leadership</Badge>
      default:
        return <Badge variant="default" className="text-[10px] uppercase font-mono font-bold">{type}</Badge>
    }
  }

  return (
    <Card className="editorial-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DF]">
        <div>
          <h2 className="text-base font-bold text-stone-900">Verified Activity Timeline</h2>
          <p className="text-xs text-stone-500 mt-0.5 font-mono">
            Chronological audit log of co-curricular engagements and contributions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'event', label: 'Events' },
            { id: 'project', label: 'Projects' },
            { id: 'club', label: 'Clubs' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedFilter(pill.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-mono transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === pill.id
                  ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                  : 'bg-[#EFE9DF] text-stone-700 hover:bg-[#E5DFD5]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-10 w-10 text-stone-400" />}
            title="No activity records found"
            description="Participation in clubs, workshops, and project teams will be verified and recorded here."
          />
        ) : (
          <div className="relative pl-6 pr-6 py-6 space-y-6 before:absolute before:left-10 before:top-6 before:bottom-6 before:w-0.5 before:bg-[#E5DFD5]">
            {filteredActivities.map((act) => {
              const meta = act.metadata || {}
              const credits = (meta.credits as number) || 1
              const clubName = (meta.club_name as string) || ''
              const role = (meta.role_applied as string) || (meta.role as string) || ''

              return (
                <div key={act.id} className="relative flex items-start gap-4 group">
                  {/* Timeline Icon */}
                  <div className="h-8 w-8 rounded-full bg-[#FDFCFA] border-2 border-[#181512]/40 shadow-xs flex items-center justify-center shrink-0 relative z-10 group-hover:border-[#E05326] transition-colors">
                    {getActivityIcon(act.activity_type)}
                  </div>

                  {/* Activity Details Card */}
                  <div className="flex-1 bg-[#F7F2E8]/60 hover:bg-[#F7F2E8] p-4 rounded-2xl border border-[#E5DFD5] transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActivityBadge(act.activity_type)}
                        <h3 className="text-sm font-bold text-stone-900">{act.title}</h3>
                      </div>
                      <span className="text-[11px] font-mono text-stone-500 font-medium">
                        {formatDate(act.occurred_at)}
                      </span>
                    </div>

                    {/* Metadata Breakdown */}
                    <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap pt-1 font-mono">
                      {clubName && (
                        <span className="flex items-center gap-1 font-semibold text-[#E05326]">
                          <Users className="h-3.5 w-3.5" />
                          {clubName}
                        </span>
                      )}
                      {role && (
                        <span className="flex items-center gap-1 text-stone-800 bg-[#FDFCFA] px-2 py-0.5 rounded-full border border-[#DCD5C9] font-medium">
                          <Briefcase className="h-3 w-3 text-[#E05326]" />
                          {role}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E05326] bg-[#E05326]/10 px-2 py-0.5 rounded-full border border-[#E05326]/30">
                        <Award className="h-3 w-3" />
                        +{credits} Credits
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
