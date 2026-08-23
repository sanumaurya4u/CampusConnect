import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#181512] text-[#F9F6F0] hover:bg-[#2C2724] border border-[#181512] shadow-xs focus:ring-[#181512]/30 active:scale-[0.98]',
  secondary: 'bg-[#FDFCFA] text-[#1C1917] hover:bg-[#EFE9DF] hover:border-stone-400 border border-[#DCD5C9] shadow-2xs focus:ring-stone-400/30 active:scale-[0.98]',
  accent: 'bg-[#E05326] text-white hover:bg-[#C94318] border border-[#E05326] shadow-xs focus:ring-[#E05326]/30 active:scale-[0.98]',
  destructive: 'bg-[#DC2626] text-white hover:bg-red-700 border border-transparent shadow-xs focus:ring-red-500/30 active:scale-[0.98]',
  outline: 'border border-[#DCD5C9] bg-transparent text-[#1C1917] hover:bg-[#EFE9DF]/80 hover:border-stone-400 focus:ring-stone-400/30 active:scale-[0.98]',
  ghost: 'text-stone-700 hover:bg-[#EFE9DF]/70 hover:text-stone-900 border border-transparent focus:ring-stone-400/30',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs font-medium gap-1.5',
  md: 'px-5 py-2.5 text-sm font-medium gap-2',
  lg: 'px-6 py-3 text-base font-semibold gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize }
