import { Sparkles, Calendar, Code2, Award, Trophy, Crown, Lock, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardBody, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { StudentAchievement } from '@/types'

interface BadgeGridProps {
  achievements: StudentAchievement[]
}

interface DefinedBadge {
  key: string
  title: string
  description: string
  icon: typeof Sparkles
  category: string
}

const ALL_SYSTEM_BADGES: DefinedBadge[] = [
  {
    key: 'club_pioneer',
    title: 'Pioneer Club Member',
    description: 'Joined an official UIET student society to foster collaborative innovation.',
    icon: Sparkles,
    category: 'Club Membership',
  },
  {
    key: 'event_enthusiast',
    title: 'Campus Workshop Enthusiast',
    description: 'Completed verified attendance check-in at a technical hands-on session.',
    icon: Calendar,
    category: 'Event Attendance',
  },
  {
    key: 'project_builder',
    title: 'Master Project Contributor',
    description: 'Earned an approved contributor position on an official UIET development project.',
    icon: Code2,
    category: 'Project Development',
  },
  {
    key: 'campus_all_rounder',
    title: 'UIET All-Rounder',
    description: 'Achieved multi-faceted engagement across clubs, events, and project recruitment.',
    icon: Trophy,
    category: 'Excellence',
  },
  {
    key: 'hackathon_contender',
    title: 'Hackathon Contender',
    description: 'Participated in an intensive inter-club competitive coding sprint or hackathon.',
    icon: Award,
    category: 'Competition',
  },
  {
    key: 'society_leader',
    title: 'Society Coordinator',
    description: 'Served as an executive coordinator leading club operations and workshops.',
    icon: Crown,
    category: 'Leadership',
  },
]

export function BadgeGrid({ achievements }: BadgeGridProps) {
  const earnedKeys = new Set(achievements.map((a) => a.badge_key))

  return (
    <Card className="editorial-card">
      <CardHeader className="flex items-center justify-between border-b border-[#EFE9DF]">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#E05326]" />
          <h2 className="text-base font-bold text-stone-900">
            Verified Badges &amp; Milestone Achievements
          </h2>
        </div>
        <Badge variant="live" className="text-[10px]">
          {achievements.length} / {ALL_SYSTEM_BADGES.length} UNLOCKED
        </Badge>
      </CardHeader>

      <CardBody className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_SYSTEM_BADGES.map((badgeDef) => {
            const isEarned = earnedKeys.has(badgeDef.key)
            const earnedRecord = achievements.find((a) => a.badge_key === badgeDef.key)
            const Icon = badgeDef.icon

            if (isEarned) {
              return (
                <div
                  key={badgeDef.key}
                  className="p-4 rounded-2xl border border-[#F6C1AF] bg-[#FDF2EE] space-y-3 relative overflow-hidden transition-all hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#E05326] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="accent" className="text-[10px] uppercase font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Unlocked
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{badgeDef.title}</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {badgeDef.description}
                    </p>
                  </div>

                  {earnedRecord && (
                    <div className="pt-2 border-t border-[#F6C1AF]/50 flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span>{badgeDef.category}</span>
                      <span className="font-bold text-[#E05326]">
                        {formatDate(earnedRecord.awarded_at)}
                      </span>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div
                key={badgeDef.key}
                className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#F7F2E8]/40 space-y-3 opacity-60 hover:opacity-90 transition-opacity"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#EFE9DF] text-stone-400 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="default" className="text-[10px] uppercase font-mono font-bold flex items-center gap-1 text-stone-400">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-700">{badgeDef.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {badgeDef.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>{badgeDef.category}</span>
                  <span>Criteria Pending</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
