import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-1.5 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded'
    const variants: Record<string, string> = {
      default: 'bg-primary text-white hover:bg-primary-dark',
      outline: 'border border-stone-200 bg-white text-stone-800 hover:bg-stone-50',
      ghost:   'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800',
    }
    const sizes: Record<string, string> = {
      default: 'px-5 py-2.5 text-sm',
      sm:      'px-3 py-1.5 text-xs',
      lg:      'px-7 py-3 text-base',
      icon:    'p-2 text-sm',
    }
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
