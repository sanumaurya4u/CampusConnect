import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, School, Calendar, FolderGit2, Settings2 } from 'lucide-react'
import {
  recommendationService,
  type PersonalizedRecommendations,
} from '@/services/recommendation.service'
import { RecommendationCard } from './RecommendationCard'
import { LoadingSpinner } from '@/components/ui'
import type { Profile } from '@/types'

interface PersonalizedDiscoveryProps {
  userId: string
  profile?: Profile | null
}

type DiscoveryTab = 'clubs' | 'events' | 'projects'

export function PersonalizedDiscoverySection({ userId, profile }: PersonalizedDiscoveryProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('clubs')
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations>({
    clubs: [],
    events: [],
    projects: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadRecommendations = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const data = await recommendationService.getAllRecommendations(userId)
      setRecommendations(data)
    } catch (err) {
      console.error('Failed to load personalized recommendations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner size="md" label="Personalizing campus opportunities for you..." />
      </div>
    )
  }

  const studentInterestsCount = profile?.interests?.length || 0

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#181512] text-[#E05326] flex items-center justify-center shadow-xs border border-stone-800">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Recommended For You
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-mono">
            Matched to your profile ({studentInterestsCount} interests active) and academic branch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-[#EFE9DF] rounded-full border border-[#E2DAD0] text-xs font-mono font-semibold">
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'clubs'
                  ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <School className="h-3.5 w-3.5" />
              <span>Societies</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>Projects</span>
            </button>
          </div>

          <Link
            to="/profile"
            className="p-2 rounded-full border border-[#DCD5C9] bg-[#FDFCFA] text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors hidden sm:flex items-center justify-center cursor-pointer shadow-2xs"
            title="Configure Recommendation Interests"
          >
            <Settings2 className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.clubs.map((club) => (
            <RecommendationCard key={club.id} type="club" item={club} />
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.events.map((event) => (
            <RecommendationCard key={event.id} type="event" item={event} />
          ))}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.projects.map((proj) => (
            <RecommendationCard key={proj.id} type="project" item={proj} />
          ))}
        </div>
      )}
    </div>
  )
}
