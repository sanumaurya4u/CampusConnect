import { useState, useEffect, useCallback } from 'react'
import { Search, FolderGit2, Filter, Code2 } from 'lucide-react'
import { projectService } from '@/services/project.service'
import { ProjectCard } from '@/components/projects'
import { SkeletonCard, EmptyState, Button } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'
import type { CampusProject, ProjectStatus } from '@/types'

const CATEGORIES = [
  'All',
  'AI & Data Science',
  'DSA & Coding',
  'Design & Digital Content',
  'Innovation & Projects',
  'Career Preparation',
  'Wellness',
]

export function ProjectsDirectoryPage() {
  useDocumentTitle('Campus Development Projects')
  const [projects, setProjects] = useState<CampusProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('open')

  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await projectService.getProjects({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined,
      })
      setProjects(data)
    } catch (err) {
      console.error('Failed to load campus projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, selectedStatus, searchQuery])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2DAD0] text-[#E05326] text-xs font-mono font-bold tracking-widest uppercase">
          <FolderGit2 className="h-3.5 w-3.5" />
          <span>Student Project Collaboration Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Campus Development <span className="text-[#E05326]">Projects.</span>
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Join real-world software, AI, hardware, and design initiatives led by official UIET student societies.
          Build your portfolio and earn Activity Passport verified project credits.
        </p>

        {/* Status Mode Switcher */}
        <div className="inline-flex p-1 bg-[#EFE9DF] rounded-full border border-[#E2DAD0] text-xs font-mono font-semibold uppercase">
          <button
            type="button"
            onClick={() => setSelectedStatus('open')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              selectedStatus === 'open'
                ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Open for Recruitment
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('active')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              selectedStatus === 'active'
                ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            In Development
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-[#181512] text-[#F9F6F0] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Projects
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search projects by title, description, or technology (e.g. React, Python, Figma, Docker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3 rounded-full border border-[#DCD5C9] bg-[#FDFCFA] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#181512]/15 focus:border-[#181512] shadow-2xs transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* Result Metrics */}
      <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-[#E5DFD5] pb-3">
        <span className="flex items-center gap-1.5">
          <Code2 className="h-4 w-4 text-[#E05326]" />
          <span>
            Showing <strong className="text-stone-900">{projects.length}</strong> Initiatives
          </span>
        </span>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-72" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-10 w-10 text-stone-400" />}
          title="No projects found"
          description="No projects match your active search and category filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('All')
                setSelectedStatus('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
