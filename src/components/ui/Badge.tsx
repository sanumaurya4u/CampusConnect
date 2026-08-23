import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'live'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#EFE9DF] text-[#44403C] border border-[#E2DAD0]',
  primary: 'bg-[#181512] text-[#F9F6F0] border border-[#181512]',
  secondary: 'bg-[#F2ECE1] text-[#635E58] border border-[#E5DFD5]',
  accent: 'bg-[#E05326]/10 text-[#E05326] border border-[#E05326]/30',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  error: 'bg-rose-50 text-rose-800 border border-rose-200',
  live: 'bg-[#E05326]/10 text-[#E05326] border border-[#E05326]/40 font-mono tracking-wider font-bold',
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, type BadgeProps, type BadgeVariant }
