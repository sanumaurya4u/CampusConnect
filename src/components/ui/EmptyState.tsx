import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-[#DCD5C9] bg-[#F7F3EB]/40', className)}>
      {icon && (
        <div className="mb-3 text-stone-400 p-3 rounded-full bg-[#EFE9DF]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-stone-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-stone-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}
