// src/components/ui/Section.tsx
import { cn } from '@/lib/utils/cn'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  bg?: 'creme' | 'beige' | 'brun' | 'white' | 'vert' | 'transparent'
}

const bgs = {
  creme:       'bg-[#FAF6EF]',
  beige:       'bg-[#F5EDD8]',
  brun:        'bg-[#5C3D2E]',
  white:       'bg-white',
  vert:        'bg-[#4A5E3A]',
  transparent: 'bg-transparent',
}

export function Section({ children, className, id, bg = 'creme' }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-16 md:py-24', bgs[bg], className)}
    >
      {children}
    </section>
  )
}
