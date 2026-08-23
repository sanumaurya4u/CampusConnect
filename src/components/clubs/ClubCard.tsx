import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { Club } from '@/types'
import { getInitials } from '@/lib/utils'

interface ClubCardProps {
  club: Club
  matchScore?: number
  matchReasons?: string[]
}

export function ClubCard({ club, matchScore }: ClubCardProps) {
  const initials = getInitials(club.name)

  return (
    <div className="editorial-card p-6 sm:p-7 flex flex-col h-full justify-between space-y-5 group">
      <div className="space-y-4">
        {/* Header with Initials badge and Category */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-11 w-11 rounded-xl bg-[#181512] text-[#F9F6F0] flex items-center justify-center text-sm font-extrabold shadow-xs shrink-0 border border-stone-800">
            {initials}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {matchScore && matchScore > 0 ? (
              <Badge variant="live" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                <span>{matchScore}% MATCH</span>
              </Badge>
            ) : null}
            <Badge variant="default" className="text-[11px] font-medium">
              {club.category}
            </Badge>
          </div>
        </div>

        {/* Club Title & Objective */}
        <div>
          <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#E05326] transition-colors">
            {club.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed font-normal">
            {club.description || club.objective || 'Official campus student club at UIET MDU Rohtak.'}
          </p>
        </div>

        {/* Supervision & Coordinator summary */}
        <div className="pt-3 border-t border-[#EFE9DF] space-y-1 text-xs font-mono text-stone-500">
          {club.faculty_incharge && (
            <p className="truncate">
              <span className="text-stone-700 font-semibold">Faculty:</span> {club.faculty_incharge}
            </p>
          )}
          {club.coordinators && club.coordinators.length > 0 && (
            <p className="truncate">
              <span className="text-stone-700 font-semibold">Lead:</span>{' '}
              {club.coordinators.map((c) => c.name).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer with Members & Link */}
      <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between">
        <span className="font-mono text-xs text-stone-500 font-medium">
          {club.member_count || 0} Registered Members
        </span>

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
