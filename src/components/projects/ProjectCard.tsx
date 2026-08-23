import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { CampusProject } from '@/types'

interface ProjectCardProps {
  project: CampusProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalOpenSlots = project.open_roles.reduce(
    (acc, role) => acc + Math.max(0, role.slots - role.filled),
    0
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="live" className="text-[10px] uppercase font-bold">RECRUITING</Badge>
      case 'active':
        return <Badge variant="primary" className="text-[10px] uppercase font-bold">IN DEV</Badge>
      case 'completed':
        return <Badge variant="secondary" className="text-[10px] uppercase font-bold">COMPLETED</Badge>
      default:
        return <Badge variant="default" className="text-[10px] uppercase font-bold">{status}</Badge>
    }
  }

  return (
    <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-5 group">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="editorial-tag text-[10px] font-mono uppercase">
              {project.category}
            </span>
            {getStatusBadge(project.status)}
          </div>
          {totalOpenSlots > 0 ? (
            <span className="text-[11px] font-mono font-bold text-[#E05326] bg-[#E05326]/10 px-2.5 py-0.5 rounded-full border border-[#E05326]/30 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {totalOpenSlots} Role{totalOpenSlots > 1 ? 's' : ''} Open
            </span>
          ) : (
            <span className="text-[11px] font-mono text-stone-400 bg-[#EFE9DF] px-2.5 py-0.5 rounded-full">
              Team Filled
            </span>
          )}
        </div>

        {/* Title & Host Club */}
        <div>
          <h3 className="text-xl font-bold text-stone-900 line-clamp-1 group-hover:text-[#E05326] transition-colors">
            {project.title}
          </h3>
          {project.club && (
            <p className="text-xs font-mono text-[#E05326] font-semibold flex items-center gap-1 mt-0.5">
              <span>By {project.club.name}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Open Roles Preview */}
        {project.open_roles && project.open_roles.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#EFE9DF]">
            <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
              Open Positions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.open_roles.map((r, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-stone-800 text-xs font-medium border border-[#E2DAD0]"
                >
                  {r.role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tech_stack.slice(0, 4).map((tech, i) => (
              <span
                key={i}
                className="text-[10px] text-stone-500 bg-[#F2ECE1] border border-[#E5DFD5] px-2 py-0.5 rounded-md font-mono"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="text-[10px] text-stone-400 font-mono self-center">
                +{project.tech_stack.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer with CTA */}
      <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between">
        <span className="font-mono text-xs text-stone-500">
          {project.open_roles?.length || 0} Open Roles
        </span>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 group-hover:text-[#E05326] transition-colors"
        >
          <span>View Roles</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
