'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle2 } from 'lucide-react'

type HomeReview = {
  id: string
  first_name: string
  rating: number
  comment: string
  is_verified_participant?: boolean
  created_at: string
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={16}
          className={n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'}
          fill={n <= value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: HomeReview }) {
  return (
    <div className="bg-white rounded-sm border border-[#D4C4A8] p-6 max-w-xl mx-auto">
      <p className="font-serif text-lg text-[#5C3D2E]">{review.first_name}</p>

      <div className="mt-2">
        <StarRow value={review.rating} />
      </div>

      {review.is_verified_participant && (
        <p className="mt-2 text-xs text-[#4A5E3A] flex items-center gap-1">
          <CheckCircle2 size={14} />
          Participant vérifié
        </p>
      )}

      <p className="mt-4 text-sm text-[#2D1F14] leading-relaxed">
        {review.comment}
      </p>
    </div>
  )
}

export function HomeReviews({ reviews }: { reviews: HomeReview[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!reviews.length) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length)
    }, 7000) // lent = premium

    return () => clearInterval(interval)
  }, [reviews])

  if (!reviews.length) return null

  return (
    <section className="py-20 bg-[#FAF6EF] text-center">
      <p className="text-xs tracking-[0.25em] uppercase text-[#C8912A] mb-3">
        Témoignages
      </p>

      <h2 className="font-serif text-3xl text-[#5C3D2E] mb-10">
        Ce qu'ils ont vécu ici
      </h2>

      <div className="relative min-h-[180px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={reviews[index].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <ReviewCard review={reviews[index]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
