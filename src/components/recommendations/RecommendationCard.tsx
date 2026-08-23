import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui'
import { getInitials } from '@/lib/utils'
import type { RecommendedClub, RecommendedEvent, RecommendedProject } from '@/services/recommendation.service'

interface RecommendationCardProps {
  type: 'club' | 'event' | 'project'
  item: RecommendedClub | RecommendedEvent | RecommendedProject
}

export function RecommendationCard({ type, item }: RecommendationCardProps) {
  const matchScore = item.matchScore || 75
  const matchReasons = item.matchReasons || []

  if (type === 'club') {
    const club = item as RecommendedClub
    const initials = getInitials(club.name)

    return (
      <div className="editorial-card p-6 flex flex-col justify-between h-full group">
        <div className="space-y-4">
          {/* Top Row: Category & Match Score */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="default" className="text-[10px] font-mono uppercase">
              {club.category}
            </Badge>
            <Badge variant="live" className="text-[10px]">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>{matchScore}% MATCH</span>
            </Badge>
          </div>

          {/* Club Info */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-10 w-10 rounded-xl bg-[#181512] text-[#F9F6F0] font-bold text-xs flex items-center justify-center shrink-0 border border-stone-800">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-stone-900 text-base truncate group-hover:text-[#E05326] transition-colors">{club.name}</h3>
              <p className="text-xs font-mono text-stone-500">{club.member_count || 0} Registered Members</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">{club.description}</p>

          {/* Match Rationale Banner */}
          {matchReasons.length > 0 && (
            <div className="p-2.5 rounded-xl bg-[#F7F2E8] border border-[#E5DFD5] text-[11px] text-stone-800 flex items-start gap-1.5 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-[#E05326] shrink-0 mt-0.5" />
              <span className="leading-tight font-medium">{matchReasons[0]}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between mt-3">
          {club.isJoined ? (
            <span className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Member
            </span>
          ) : (
            <span className="text-xs font-mono text-stone-400">Discover Society</span>
          )}

          <Link
            to={`/clubs/${club.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-[#E05326] transition-colors"
          >
            <span>Enter</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    )
  }

  if (type === 'event') {
    const event = item as RecommendedEvent

    return (
      <div className="editorial-card p-6 flex flex-col justify-between h-full group">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase font-mono font-bold">
              {event.event_type}
            </Badge>
            <Badge variant="live" className="text-[10px]">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>{matchScore}% MATCH</span>
            </Badge>
          </div>

          <div className="pt-1">
            <h3 className="font-bold text-stone-900 text-base line-clamp-1 group-hover:text-[#E05326] transition-colors">{event.title}</h3>
            <p className="text-xs font-mono text-[#E05326] font-semibold mt-0.5">
              Hosted by {event.club?.name || 'UIET Society'}
            </p>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{event.description}</p>

          {/* Match Rationale */}
          {matchReasons.length > 0 && (
            <div className="p-2.5 rounded-xl bg-[#F7F2E8] border border-[#E5DFD5] text-[11px] text-stone-800 flex items-start gap-1.5 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-[#E05326] shrink-0 mt-0.5" />
              <span className="leading-tight font-medium">{matchReasons[0]}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between mt-3">
          {event.isRegistered ? (
            <span className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Registered
            </span>
          ) : (
            <span className="text-xs font-mono text-stone-400">Venue: {event.venue}</span>
          )}

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-[#E05326] transition-colors"
          >
            <span>{event.isRegistered ? 'View Pass' : 'Register'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    )
  }

  // Project Type
  const project = item as RecommendedProject

  return (
    <div className="editorial-card p-6 flex flex-col justify-between h-full group">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="default" className="text-[10px] font-mono uppercase">
            {project.category}
          </Badge>
          <Badge variant="live" className="text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>{matchScore}% MATCH</span>
          </Badge>
        </div>

        <div className="pt-1">
          <h3 className="font-bold text-stone-900 text-base line-clamp-1 group-hover:text-[#E05326] transition-colors">{project.title}</h3>
          <p className="text-xs font-mono text-[#E05326] font-semibold mt-0.5">
            {project.open_roles?.length || 0} Open Roles Available
          </p>
        </div>

        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{project.description}</p>

        {/* Match Rationale */}
        {matchReasons.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[#F7F2E8] border border-[#E5DFD5] text-[11px] text-stone-800 flex items-start gap-1.5 font-mono">
            <Sparkles className="h-3.5 w-3.5 text-[#E05326] shrink-0 mt-0.5" />
            <span className="leading-tight font-medium">{matchReasons[0]}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between mt-3">
        {project.hasApplied ? (
          <span className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Applied
          </span>
        ) : (
          <span className="text-xs font-mono text-stone-400">Recruiting Now</span>
        )}

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-[#E05326] transition-colors"
        >
          <span>Apply</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
