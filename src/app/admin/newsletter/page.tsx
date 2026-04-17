'use client'

import { useEffect, useMemo, useState } from 'react'

type Subscriber = {
  email: string
  created_at?: string
}

type NewsletterItem = {
  _id: string
  title?: string
  status?: string
  _updatedAt?: string
}

function formatStatus(status?: string) {
  if (status === 'draft') return 'Brouillon'
  if (status === 'ready') return 'Prête'
  if (status === 'sent') return 'Envoyée'
  return 'Sans statut'
}

function isSentStatus(status?: string) {
  return status === 'sent'
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([])
  const [newsletterId, setNewsletterId] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [copyState, setCopyState] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : [])
        const items = Array.isArray(data.newsletters) ? data.newsletters : []
        setNewsletters(items)

        if (items.length > 0) {
          const readyItem = items.find((item: NewsletterItem) => item.status === 'ready')
          setNewsletterId(readyItem?._id || items[0]._id || '')
        }
      })
      .catch(() => {
        setStatus('Erreur lors du chargement des données.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const emails = useMemo(
    () => subscribers.map((item) => item.email).filter(Boolean),
    [subscribers]
  )

  const selectedNewsletter = useMemo(
    () => newsletters.find((item) => item._id === newsletterId) || null,
    [newsletters, newsletterId]
  )

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(emails.join(', '))
      setCopyState('Emails copiés.')
      setTimeout(() => setCopyState(''), 2500)
    } catch {
      setCopyState('Impossible de copier.')
      setTimeout(() => setCopyState(''), 2500)
    }
  }

  async function sendNewsletter() {
    const trimmedId = newsletterId.trim()

    if (!trimmedId) {
      setStatus('Sélectionnez une newsletter avant l’envoi.')
      return
    }

    const label = selectedNewsletter?.title || 'cette newsletter'
    const confirmed = window.confirm(
      `Confirmer l’envoi de "${label}" à ${emails.length} abonné(s) ?`
    )

    if (!confirmed) return

    setSending(true)
    setStatus('Envoi en cours...')

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: trimmedId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.error || 'Erreur pendant l’envoi.')
        return
      }

      setStatus(
        `Newsletter envoyée. ${data.sent} email(s) envoyés, ${data.failed} échec(s).` +
        (data.statusUpdatedToSent ? ` Le statut a été mis à "Envoyée".` : '')
      )

      setNewsletters((current) =>
        current.map((item) =>
          item._id === trimmedId ? { ...item, status: 'sent' } : item
        )
      )
    } catch {
      setStatus('Erreur réseau pendant l’envoi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">
            Administration
          </p>
          <h1 className="font-serif text-3xl text-[#5C3D2E]">
            Newsletter
          </h1>
          <p className="text-sm font-sans text-[#7A6355] mt-2">
            Gérez les abonnés et envoyez une newsletter créée dans Sanity.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="bg-white rounded-sm border border-[#D4C4A8] p-6">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <h2 className="font-serif text-xl text-[#5C3D2E]">Abonnés</h2>
                <p className="text-sm font-sans text-[#7A6355] mt-1">
                  {loading ? 'Chargement...' : `${emails.length} adresse(s) enregistrée(s)`}
                </p>
              </div>

              <button
                onClick={copyAll}
                disabled={!emails.length}
                className="px-4 py-2 bg-[#5C3D2E] text-white rounded-sm disabled:opacity-50"
              >
                Copier tous les emails
              </button>
            </div>

            {copyState ? (
              <p className="text-sm font-sans text-[#4A5E3A] mb-4">{copyState}</p>
            ) : null}

            <div className="border border-[#E8DDC7] rounded-sm overflow-hidden bg-[#FFFCF7]">
              {loading ? (
                <div className="p-4 text-sm text-[#7A6355]">Chargement des abonnés...</div>
              ) : emails.length === 0 ? (
                <div className="p-4 text-sm text-[#7A6355]">Aucun abonné newsletter pour le moment.</div>
              ) : (
                <div className="max-h-[520px] overflow-auto">
                  {emails.map((email, index) => (
                    <div
                      key={email + index}
                      className="px-4 py-3 text-sm font-sans text-[#2D1F14] border-b border-[#F0E8DA] last:border-b-0"
                    >
                      {email}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-sm border border-[#D4C4A8] p-6">
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-4">
              Envoi d’une newsletter
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sans text-[#5C3D2E] mb-2">
                  Newsletter à envoyer
                </label>

                <select
                  value={newsletterId}
                  onChange={(e) => setNewsletterId(e.target.value)}
                  className="w-full border border-[#D4C4A8] rounded-sm px-3 py-2 bg-[#FFFCF7] text-[#2D1F14]"
                >
                  <option value="">Sélectionner une newsletter</option>
                  {newsletters.map((item) => (
                    <option key={item._id} value={item._id}>
                      {(item.title || 'Sans titre') + ' — ' + formatStatus(item.status)}
                    </option>
                  ))}
                </select>

                <p className="text-xs font-sans text-[#7A6355] mt-2">
                  Les newsletters sont récupérées automatiquement depuis Sanity.
                </p>
              </div>

              <div className="bg-[#FAF6EF] border border-[#E8DDC7] rounded-sm p-4 space-y-2">
                <p className="text-sm font-sans text-[#5C3D2E]">
                  Cette action enverra la newsletter à <strong>{emails.length}</strong> abonné(s).
                </p>

                {selectedNewsletter ? (
                  <div className="text-sm font-sans text-[#2D1F14]">
                    <div><strong>Titre :</strong> {selectedNewsletter.title || 'Sans titre'}</div>
                    <div><strong>Statut :</strong> {formatStatus(selectedNewsletter.status)}</div>
                  </div>
                ) : (
                  <div className="text-sm font-sans text-[#7A6355]">
                    Aucune newsletter sélectionnée.
                  </div>
                )}
              </div>

              <button
                onClick={sendNewsletter}
                disabled={sending || !emails.length || !newsletterId || isSentStatus(selectedNewsletter?.status)}
                className="w-full px-4 py-3 bg-[#4A5E3A] text-white rounded-sm disabled:opacity-50"
              >
                {sending
                  ? 'Envoi en cours...'
                  : isSentStatus(selectedNewsletter?.status)
                    ? 'Newsletter déjà envoyée'
                    : 'Envoyer la newsletter'}
              </button>

              {status ? (
                <div className="border border-[#E8DDC7] rounded-sm p-4 bg-[#FFFCF7]">
                  <p className="text-sm font-sans text-[#2D1F14] whitespace-pre-wrap">{status}</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
