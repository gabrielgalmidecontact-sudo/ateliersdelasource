// src/components/ui/Button.tsx
'use client'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  external?: boolean
  asChild?: boolean
}

const variants = {
  primary:   'bg-[#5C3D2E] text-[#F5EDD8] hover:bg-[#3B2315] border border-[#5C3D2E] hover:border-[#3B2315]',
  secondary: 'bg-[#C8912A] text-white hover:bg-[#a87820] border border-[#C8912A]',
  outline:   'bg-transparent text-[#5C3D2E] border border-[#5C3D2E] hover:bg-[#5C3D2E] hover:text-[#F5EDD8]',
  ghost:     'bg-transparent text-[#5C3D2E] hover:bg-[#F5EDD8] border border-transparent',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, external, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium',
      'transition-all duration-200 ease-in-out cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8912A] focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'tracking-wide uppercase text-xs letter-spacing-widest',
      variants[variant],
      sizes[size],
      className,
    )

    if (href) {
      return (
        <Link
          href={href}
          className={classes}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
export { Button }
