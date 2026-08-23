import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Sparkles, Filter, RefreshCw, Layers } from 'lucide-react'
import { clubService } from '@/services/club.service'
import { recommendationService, type RecommendedClub } from '@/services/recommendation.service'
import { useAuth } from '@/features/auth'
import { useDocumentTitle } from '@/hooks'
import { ClubCard } from '@/components/clubs'
import { SkeletonCard, EmptyState, Button } from '@/components/ui'
import { CLUB_CATEGORIES } from '@/constants'

export function ClubDirectoryPage() {
  useDocumentTitle('Explore Campus Clubs')
  const { user } = useAuth()
  const [clubs, setClubs] = useState<RecommendedClub[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortByMatch] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClubs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (user?.id) {
        const recClubs = await recommendationService.getRecommendedClubs(user.id)
        setClubs(recClubs)
      } else {
        const data = await clubService.getClubs()
        setClubs(data.map((c) => ({ ...c, matchScore: 0, matchReasons: [] })))
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to load clubs right now. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchClubs()
  }, [fetchClubs])

  // Filter & Sort clubs
  const filteredClubs = useMemo(() => {
    const list = clubs.filter((club) => {
      const matchesCategory =
        selectedCategory === 'All' || club.category === selectedCategory

      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        club.name.toLowerCase().includes(query) ||
        club.category.toLowerCase().includes(query) ||
        (club.description && club.description.toLowerCase().includes(query)) ||
        (club.objective && club.objective.toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })

    if (sortByMatch && user) {
      return [...list].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    }

    return list
  }, [clubs, selectedCategory, searchQuery, sortByMatch, user])

  const categories = ['All', ...CLUB_CATEGORIES]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Directory Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] text-[#E05326] text-xs font-mono font-bold tracking-widest uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>UIET Campus Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Explore Campus <span className="text-[#E05326]">Clubs.</span>
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Discover student communities, engineering technical societies, and creative groups that match your skills and goals.
        </p>
      </div>

      {/* Search & Category Filter Section */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search societies by name, domain, or technology (e.g. AI, DSA, Design, IoT)..."
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                    : 'bg-[#EFE9DF] text-stone-700 border border-[#E2DAD0] hover:border-stone-400 hover:text-stone-950'
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
            Showing <strong className="text-stone-900 font-bold">{filteredClubs.length}</strong> of{' '}
            <strong className="text-stone-900 font-bold">{clubs.length}</strong> Societies
          </span>
        </div>

        {(selectedCategory !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All')
              setSearchQuery('')
            }}
            className="text-[#E05326] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Content States: Loading, Error, Empty, Success */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} className="h-64" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClubs}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry Loading
          </Button>
        </div>
      ) : filteredClubs.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-10 w-10 text-stone-400" />}
          title="No societies found"
          description={
            searchQuery || selectedCategory !== 'All'
              ? `No clubs matched your search "${searchQuery || selectedCategory}". Try adjusting your filters.`
              : 'No campus clubs are currently active.'
          }
          action={
            (searchQuery || selectedCategory !== 'All') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
              >
                Clear All Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              matchScore={club.matchScore}
              matchReasons={club.matchReasons}
            />
          ))}
        </div>
      )}
    </div>
  )
}
