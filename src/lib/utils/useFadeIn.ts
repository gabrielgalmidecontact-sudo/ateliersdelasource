// src/lib/utils/useFadeIn.ts
'use client'
import { useEffect, useRef, useState } from 'react'

export function useFadeIn(delay = 0, threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay)
          } else {
            setVisible(true)
          }
          obs.unobserve(el)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, threshold])

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  }

  return { ref, visible, style }
}

export function useFadeInX(delay = 0, direction: 'left' | 'right' = 'right') {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, direction])

  const translateX = direction === 'right' ? '20px' : '-20px'
  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : `translateX(${translateX})`,
    transition: `opacity 0.6s ease-out, transform 0.6s ease-out`,
  }

  return { ref, visible, style }
}
