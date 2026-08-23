import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Calendar, Filter, RefreshCw, Layers } from 'lucide-react'
import { eventService } from '@/services/event.service'
import { recommendationService, type RecommendedEvent } from '@/services/recommendation.service'
import { useAuth } from '@/features/auth'
import { useDocumentTitle } from '@/hooks'
import { EventCard } from '@/components/events'
import { SkeletonCard, EmptyState, Button } from '@/components/ui'
import { CLUB_CATEGORIES } from '@/constants'

const EVENT_TYPES = [
  { id: 'all', label: 'All Formats' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'seminar', label: 'Seminars' },
  { id: 'competition', label: 'Competitions' },
]

export function EventsDirectoryPage() {
  useDocumentTitle('Campus Events & Workshops')
  const { user } = useAuth()
  const [events, setEvents] = useState<RecommendedEvent[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (user?.id) {
        const recEvents = await recommendationService.getRecommendedEvents(user.id)
        setEvents(recEvents)
      } else {
        const data = await eventService.getEvents()
        setEvents(data.map((e) => ({ ...e, matchScore: 0, matchReasons: [] })))
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to load events right now. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        selectedCategory === 'All' || event.category === selectedCategory
      const matchesType =
        selectedType === 'all' || event.event_type === selectedType
      const isPast = new Date(event.end_time) < new Date()
      const matchesTimeframe = timeframe === 'upcoming' ? !isPast : isPast

      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query))

      return matchesCategory && matchesType && matchesTimeframe && matchesSearch
    })
  }, [events, selectedCategory, selectedType, timeframe, searchQuery])

  const categories = ['All', ...CLUB_CATEGORIES]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] text-[#E05326] text-xs font-mono font-bold tracking-widest uppercase">
          <Calendar className="h-3.5 w-3.5" />
          <span>UIET Campus Calendar</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Events &amp; <span className="text-[#E05326]">Workshops.</span>
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Register for hands-on bootcamps, competitive hackathons, and guest seminars hosted by UIET student societies.
        </p>
      </div>

      {/* Timeframe Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-[#EFE9DF] rounded-full border border-[#E2DAD0]">
          <button
            onClick={() => setTimeframe('upcoming')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider font-mono transition-all cursor-pointer ${
              timeframe === 'upcoming'
                ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setTimeframe('past')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider font-mono transition-all cursor-pointer ${
              timeframe === 'past'
                ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Past Archive
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search events by title, venue, or keywords (e.g. AI, Python, Figma, Hackathon)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3 rounded-full border border-[#DCD5C9] bg-[#FDFCFA] text-sm text-stone-900 shadow-2xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#181512]/15 focus:border-[#181512] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-mono font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Event Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
          {EVENT_TYPES.map((type) => {
            const isSelected = selectedType === type.id
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                    : 'bg-[#EFE9DF] text-stone-700 border border-[#E2DAD0] hover:border-stone-400 hover:text-stone-950'
                }`}
              >
                {type.label}
              </button>
            )
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E05326] text-white shadow-xs'
                    : 'bg-[#F2ECE1] text-stone-600 border border-[#E5DFD5] hover:bg-[#EFE9DF]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Header / Stats */}
      <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-[#E5DFD5] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#E05326]" />
          <span>
            Showing <strong className="text-stone-900 font-bold">{filteredEvents.length}</strong> of{' '}
            <strong className="text-stone-900 font-bold">{events.length}</strong> Events
          </span>
        </div>

        {(selectedCategory !== 'All' || selectedType !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All')
              setSelectedType('all')
              setSearchQuery('')
            }}
            className="text-[#E05326] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Event Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-72" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry Loading
          </Button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-10 w-10 text-stone-400" />}
          title="No events found"
          description={
            searchQuery || selectedCategory !== 'All' || selectedType !== 'all'
              ? `No ${timeframe} events matched your filters. Try clearing or searching another topic.`
              : `No ${timeframe} events scheduled at this moment.`
          }
          action={
            (searchQuery || selectedCategory !== 'All' || selectedType !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedType('all')
                  setSearchQuery('')
                }}
              >
                Clear All Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} matchScore={event.matchScore} />
          ))}
        </div>
      )}
    </div>
  )
}
