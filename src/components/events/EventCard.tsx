import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ArrowRight, Sparkles, Handshake } from 'lucide-react'
import { Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { CampusEvent } from '@/types'

interface EventCardProps {
  event: CampusEvent
  matchScore?: number
}

export function EventCard({ event, matchScore }: EventCardProps) {
  const startDate = new Date(event.start_time)
  const isPast = new Date(event.end_time) < new Date()
  const isJointEvent = event.tags?.some((t) => t.toLowerCase().includes('joint') || t.toLowerCase().includes('collab'))

  // Format time (e.g. 2:00 PM)
  const timeString = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Capacity calculation
  const regCount = event.registration_count || 0
  const maxCap = event.max_capacity
  const isFull = maxCap ? regCount >= maxCap : false
  const percentFull = maxCap ? Math.min(100, Math.round((regCount / maxCap) * 100)) : 0

  const getEventTypeVariant = (type: string) => {
    switch (type) {
      case 'hackathon':
      case 'competition':
        return 'accent'
      case 'workshop':
        return 'primary'
      case 'seminar':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className="editorial-card p-6 sm:p-7 flex flex-col h-full justify-between space-y-5 group">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getEventTypeVariant(event.event_type)} className="text-[10px] uppercase font-mono font-bold tracking-wider">
              {event.event_type}
            </Badge>
            {matchScore && matchScore > 0 ? (
              <Badge variant="live" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                <span>{matchScore}% MATCH</span>
              </Badge>
            ) : null}
            {isJointEvent && (
              <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                <Handshake className="h-3 w-3 mr-1" />
                <span>Joint Initiative</span>
              </Badge>
            )}
          </div>
          <Badge variant="default" className="text-[11px]">
            {event.category}
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#E05326] transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Host Club */}
          {event.club && (
            <p className="mt-1 text-xs font-mono text-[#E05326] font-semibold flex items-center gap-1">
              <span>Hosted by {event.club.name}</span>
            </p>
          )}

          {/* Description snippet */}
          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Date, Time & Venue */}
        <div className="pt-3 border-t border-[#EFE9DF] space-y-2 text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-stone-700 shrink-0" />
            <span className="font-semibold text-stone-800">{formatDate(event.start_time)}</span>
            <span className="text-stone-300">&bull;</span>
            <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>{timeString}</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-[#E05326] shrink-0" />
            <span className="truncate text-stone-700">{event.venue}</span>
          </div>

          {/* Capacity Progress */}
          {maxCap && maxCap > 0 && !isPast && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">
                  {isFull ? 'At Full Capacity' : `${regCount} / ${maxCap} Registered`}
                </span>
                <span className="font-bold text-stone-700">{percentFull}%</span>
              </div>
              <div className="w-full bg-[#EFE9DF] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : 'bg-[#E05326]'
                  }`}
                  style={{ width: `${percentFull}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with CTA */}
      <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between">
        <span className="font-mono text-xs text-stone-500">
          {isPast ? 'Concluded Session' : (event as { isRegistered?: boolean; is_registered?: boolean }).isRegistered || (event as { isRegistered?: boolean; is_registered?: boolean }).is_registered ? 'Ticket Confirmed' : 'Seats Open'}
        </span>

        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-[#E05326] transition-colors"
        >
          <span>{(event as { isRegistered?: boolean; is_registered?: boolean }).isRegistered || (event as { isRegistered?: boolean; is_registered?: boolean }).is_registered ? 'View Pass' : 'Register'}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
