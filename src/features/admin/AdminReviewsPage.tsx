'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, Eye, EyeOff, Loader2, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

type AdminReview = {
  id: string
  content_type: 'event' | 'activity'
  content_slug: string
  content_title: string
  member_id: string | null
  reservation_id: string | null
  first_name: string
  email: string
  rating: number
  comment: string
  is_published: boolean
  is_verified_participant: boolean
  published_at: string | null
  created_at: string
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'}>
          <Star size={16} fill={n <= value ? 'currentColor' : 'none'} />
        </span>
      ))}
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function AdminReviewsPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'published'>('pending')

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/connexion')
        return
      }
      if (!isAdmin) {
        router.push('/espace-membre')
      }
    }
  }, [user, isAdmin, isLoading, router])

  async function loadReviews(nextFilter = filter) {
    if (!user?.accessToken) return
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/reviews?status=${nextFilter}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setReviews(data.reviews || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.accessToken && isAdmin) {
      loadReviews(filter)
    }
  }, [user, isAdmin, filter])

  const pendingCount = useMemo(
    () => reviews.filter((review) => !review.is_published).length,
    [reviews]
  )

  async function togglePublish(review: AdminReview, nextPublished: boolean) {
    if (!user?.accessToken) return
    setSavingId(review.id)

    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ is_published: nextPublished }),
      })

      if (res.ok) {
        await loadReviews(filter)
      }
    } finally {
      setSavingId(null)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] py-10">
      <Container>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-sans text-[#7A6355] hover:text-[#5C3D2E] mb-6"
        >
          <ArrowLeft size={14} />
          Retour au dashboard
        </Link>

        <div className="mb-8">
          <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">
            Administration
          </p>
          <h1 className="font-serif text-3xl text-[#5C3D2E]">Avis & témoignages</h1>
          <p className="text-sm font-sans text-[#7A6355] mt-2">
            Gérez les avis laissés par les membres avant leur publication sur le site.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-5">
            <p className="text-xs font-sans text-[#7A6355]">En attente</p>
            <p className="font-serif text-3xl text-[#C8912A] mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-5">
            <p className="text-xs font-sans text-[#7A6355]">Publiés</p>
            <p className="font-serif text-3xl text-[#4A5E3A] mt-1">
              {reviews.filter((review) => review.is_published).length}
            </p>
          </div>
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-5">
            <p className="text-xs font-sans text-[#7A6355]">Total affiché</p>
            <p className="font-serif text-3xl text-[#5C3D2E] mt-1">{reviews.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button type="button" variant={filter === 'pending' ? 'secondary' : 'outline'} size="md" onClick={() => setFilter('pending')}>
            En attente
          </Button>
          <Button type="button" variant={filter === 'published' ? 'secondary' : 'outline'} size="md" onClick={() => setFilter('published')}>
            Publiés
          </Button>
          <Button type="button" variant={filter === 'all' ? 'secondary' : 'outline'} size="md" onClick={() => setFilter('all')}>
            Tous
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
            <p className="font-sans text-[#7A6355]">Aucun avis dans cette vue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif text-xl text-[#5C3D2E]">{review.first_name}</h2>
                      <span className={`inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded-full ${review.is_published ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                        {review.is_published ? <Eye size={12} /> : <Clock size={12} />}
                        {review.is_published ? 'Publié' : 'En attente'}
                      </span>
                      {review.is_verified_participant ? (
                        <span className="inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded-full bg-[#F0F5EC] text-[#4A5E3A]">
                          <CheckCircle size={12} />
                          Participant vérifié
                        </span>
                      ) : null}
                    </div>

                    <StarRow value={review.rating} />

                    <p className="text-sm font-sans text-[#7A6355]">
                      {review.content_type === 'event' ? 'Événement' : 'Activité'} · {review.content_title}
                    </p>

                    <p className="text-xs font-sans text-[#7A6355]">
                      Reçu le {formatDate(review.created_at)} · {review.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {review.content_type === 'event' ? (
                      <Button
                        href={`/evenements/${review.content_slug}`}
                        variant="outline"
                        size="md"
                      >
                        Voir la page liée
                      </Button>
                    ) : (
                      <Button
                        href={`/activites/${review.content_slug}`}
                        variant="outline"
                        size="md"
                      >
                        Voir la page liée
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant={review.is_published ? 'outline' : 'secondary'}
                      size="md"
                      disabled={savingId === review.id}
                      onClick={() => togglePublish(review, !review.is_published)}
                    >
                      {savingId === review.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Enregistrement...
                        </>
                      ) : review.is_published ? (
                        <>
                          <EyeOff size={16} />
                          Dépublier
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          Publier
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-5 rounded-sm border border-[#F0E8DA] bg-[#FAF6EF] p-4">
                  <p className="text-base font-sans leading-relaxed text-[#2D1F14] whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
