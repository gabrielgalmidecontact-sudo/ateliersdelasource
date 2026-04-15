'use client'

import { useMemo, useState } from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'

type ReviewItem = {
  id: string
  content_title?: string
  first_name: string
  rating: number
  comment: string
  is_verified_participant?: boolean
  created_at: string
}

type ReviewsSectionProps = {
  title?: string
  intro?: string
  contentType: 'event' | 'activity'
  contentSlug: string
  contentTitle: string
  initialReviews?: ReviewItem[]
  compact?: boolean
  showForm?: boolean
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function StarRating({
  value,
  onChange,
  size = 18,
}: {
  value: number
  onChange?: (value: number) => void
  size?: number
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`transition-colors ${
            n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'
          } ${onChange ? 'hover:text-[#C8912A] cursor-pointer' : 'cursor-default'}`}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, compact = false }: { review: ReviewItem; compact?: boolean }) {
  return (
    <article className="bg-white rounded-sm border border-[#D4C4A8] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-serif text-lg text-[#5C3D2E]">{review.first_name}</p>
          <div className="mt-2">
            <StarRating value={review.rating} size={16} />
          </div>
        </div>

        <div className="text-right">
          {review.is_verified_participant ? (
            <p className="inline-flex items-center gap-1 text-xs font-sans text-[#4A5E3A]">
              <CheckCircle2 size={14} />
              Participant vérifié
            </p>
          ) : null}
          <p className="mt-1 text-xs font-sans text-[#7A6355]">{formatDate(review.created_at)}</p>
        </div>
      </div>

      <p className={`mt-4 font-sans leading-relaxed text-[#2D1F14] ${compact ? 'text-sm' : 'text-base'}`}>
        {review.comment}
      </p>

      {!compact && review.content_title ? (
        <p className="mt-4 text-xs font-sans uppercase tracking-wider text-[#C8912A]">
          {review.content_title}
        </p>
      ) : null}
    </article>
  )
}

export function ReviewsSection({
  title = 'Ils ont vécu cette expérience',
  intro = 'Quelques retours partagés par les participants.',
  contentType,
  contentSlug,
  contentTitle,
  initialReviews = [],
  compact = false,
  showForm = true,
}: ReviewsSectionProps) {
  const reviews = initialReviews
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const average = useMemo(() => {
    if (!reviews.length) return null
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('idle')

    if (!firstName.trim()) {
      setError('Le prénom est requis.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Un email valide est requis.')
      return
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setError('Votre commentaire doit contenir au moins 10 caractères.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentSlug,
          contentTitle,
          firstName,
          email,
          rating,
          comment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de l’envoi.')
      }

      setStatus('success')
      setFirstName('')
      setEmail('')
      setRating(5)
      setComment('')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={compact ? 'py-8' : 'py-12'} aria-labelledby="reviews-title">
      <div className="mb-8">
        <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-3">Avis</p>
        <h2 id="reviews-title" className="font-serif text-2xl md:text-3xl text-[#5C3D2E]">
          {title}
        </h2>
        <p className="mt-3 text-sm md:text-base font-sans text-[#7A6355] leading-relaxed max-w-2xl">
          {intro}
        </p>

        {average ? (
          <div className="mt-4 flex items-center gap-3">
            <StarRating value={Math.round(Number(average))} />
            <p className="text-sm font-sans text-[#5C3D2E]">
              Note moyenne : <span className="font-semibold">{average}/5</span>
            </p>
          </div>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <div className={`grid gap-5 ${compact ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} compact={compact} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
          <p className="font-sans text-[#7A6355]">
            Aucun avis publié pour le moment sur cette proposition.
          </p>
        </div>
      )}

      {showForm ? (
        <div className="mt-10 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8] p-6 md:p-8">
          <h3 className="font-serif text-xl text-[#5C3D2E]">Laisser un avis</h3>
          <p className="mt-2 text-sm font-sans text-[#7A6355]">
            Votre retour sera relu avant publication sur le site.
          </p>

          {status === 'success' ? (
            <div className="mt-6 rounded-sm border border-[#B8D4A8] bg-[#F0F5EC] p-4">
              <p className="font-sans text-sm text-[#4A5E3A]">
                Merci. Votre avis a bien été enregistré et sera publié après validation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  label="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                />
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <p className="block text-sm font-sans font-medium text-[#5C3D2E] mb-2">Votre note</p>
                <StarRating value={rating} onChange={setRating} size={22} />
              </div>

              <Textarea
                name="comment"
                label="Votre commentaire"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez ce que vous avez vécu, ce que cette expérience vous a apporté…"
                rows={5}
                error={status === 'error' ? error : undefined}
              />

              <div className="flex flex-wrap gap-3 items-center">
                <Button type="submit" variant="secondary" size="md" disabled={submitting}>
                  {submitting ? 'Envoi…' : 'Envoyer mon avis'}
                </Button>
                <p className="text-xs font-sans text-[#7A6355]">
                  Seul votre prénom sera affiché publiquement.
                </p>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </section>
  )
}
