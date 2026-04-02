// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'ocre' | 'vert' | 'brun' | 'ghost'
  className?: string
}

const variants = {
  default: 'bg-[#F5EDD8] text-[#5C3D2E] border border-[#D4C4A8]',
  ocre:    'bg-[#C8912A]/15 text-[#C8912A] border border-[#C8912A]/30',
  vert:    'bg-[#4A5E3A]/10 text-[#4A5E3A] border border-[#4A5E3A]/30',
  brun:    'bg-[#5C3D2E]/10 text-[#5C3D2E] border border-[#5C3D2E]/30',
  ghost:   'bg-transparent text-[#7A6355] border border-[#D4C4A8]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-medium tracking-wide uppercase',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  )
}
