// src/components/ui/Heading.tsx
import { cn } from '@/lib/utils/cn'

interface HeadingProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  centered?: boolean
  light?: boolean
}

const sizes = {
  xs:  'text-lg md:text-xl',
  sm:  'text-xl md:text-2xl',
  md:  'text-2xl md:text-3xl',
  lg:  'text-3xl md:text-4xl',
  xl:  'text-4xl md:text-5xl',
  '2xl': 'text-5xl md:text-6xl',
}

export function Heading({
  children,
  as: Tag = 'h2',
  size = 'md',
  className,
  centered = false,
  light = false,
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        'font-serif leading-tight',
        sizes[size],
        light ? 'text-[#F5EDD8]' : 'text-[#5C3D2E]',
        centered && 'text-center',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

interface SectionTitleProps {
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
  className?: string
}

export function SectionTitle({ title, subtitle, centered = true, light = false, className }: SectionTitleProps) {
  return (
    <div className={cn('mb-12', centered && 'text-center', className)}>
      <Heading as="h2" size="lg" light={light} centered={centered}>
        {title}
      </Heading>
      {subtitle && (
        <p className={cn('mt-4 text-base md:text-lg max-w-2xl font-sans', centered && 'mx-auto', light ? 'text-[#E8D8B8]' : 'text-[#7A6355]')}>
          {subtitle}
        </p>
      )}
      <div className={cn('mt-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF50] to-transparent', centered && 'mx-auto')} />
    </div>
  )
}
