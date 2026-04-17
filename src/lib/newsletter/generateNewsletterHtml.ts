import { imageUrl } from '@/lib/sanity/image'

type SanityImage = {
  _type?: string
  asset?: unknown
  alt?: string
  caption?: string
  hotspot?: unknown
  crop?: unknown
}

type NewsletterItem = {
  title?: string
  excerpt?: string
  slug?: { current?: string } | string
  startDate?: string
  publishedAt?: string
  coverImage?: SanityImage
  heroImage?: SanityImage
}

type NewsletterType = 'event' | 'post' | 'activity'

function getSlug(value: NewsletterItem['slug']) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.current || ''
}

function formatDateFr(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function escapeHtml(value?: string) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildUrl(type: NewsletterType, slug?: NewsletterItem['slug']) {
  const cleanSlug = getSlug(slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'
  if (!cleanSlug) return baseUrl

  if (type === 'event') return `${baseUrl}/evenements/${cleanSlug}`
  if (type === 'post') return `${baseUrl}/blog/${cleanSlug}`
  return `${baseUrl}/activites/${cleanSlug}`
}

function getItemImage(item: NewsletterItem, type: NewsletterType) {
  const source =
    type === 'activity'
      ? item.heroImage || item.coverImage
      : item.coverImage

  if (!source?.asset) return ''

  return imageUrl(source, 1200, 720) || ''
}

function getItemAlt(item: NewsletterItem) {
  return escapeHtml(item.heroImage?.alt || item.coverImage?.alt || item.title || 'Visuel')
}

function getTypeLabel(type: NewsletterType) {
  if (type === 'event') return 'Événement'
  if (type === 'post') return 'Article'
  return 'Activité'
}

function getItemMeta(item: NewsletterItem, type: NewsletterType) {
  if (type === 'event') return formatDateFr(item.startDate)
  if (type === 'post') return formatDateFr(item.publishedAt)
  return 'Les Ateliers de la Source'
}

function sectionTitle(label: string, subtitle: string) {
  return `
    <tr>
      <td style="padding:0 0 18px 0;">
        <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C8912A;margin-bottom:6px;">
          ${escapeHtml(label)}
        </div>
        <div style="font-family:Georgia,serif;font-size:24px;line-height:1.25;color:#5C3D2E;margin-bottom:10px;">
          ${escapeHtml(subtitle)}
        </div>
        <div style="width:64px;height:2px;background:#C8912A;"></div>
      </td>
    </tr>
  `
}

function primaryCard(item: NewsletterItem, type: NewsletterType) {
  const title = escapeHtml(item.title || 'Sans titre')
  const excerpt = escapeHtml(item.excerpt || '')
  const url = buildUrl(type, item.slug)
  const image = getItemImage(item, type)
  const alt = getItemAlt(item)
  const typeLabel = getTypeLabel(type)
  const meta = getItemMeta(item, type)

  return `
    <tr>
      <td style="padding:0 0 26px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E7DCC8;background:#FFFCF8;">
          ${
            image
              ? `
          <tr>
            <td>
              <img
                src="${image}"
                alt="${alt}"
                width="610"
                style="display:block;width:100%;max-width:610px;height:auto;border:0;line-height:100%;"
              />
            </td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding:26px 26px 28px 26px;">
              <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#C8912A;margin:0 0 12px 0;">
                ${escapeHtml(typeLabel)}${meta ? ` · ${escapeHtml(meta)}` : ''}
              </div>
              <div style="font-family:Georgia,serif;font-size:30px;line-height:1.2;color:#5C3D2E;margin:0 0 14px 0;">
                ${title}
              </div>
              ${
                excerpt
                  ? `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.8;color:#2D1F14;margin:0 0 20px 0;">
                      ${excerpt}
                    </div>`
                  : ''
              }
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#5C3D2E;padding:12px 20px;">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#F5EDD8;text-decoration:none;">
                      Découvrir →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

function compactCard(item: NewsletterItem, type: NewsletterType) {
  const title = escapeHtml(item.title || 'Sans titre')
  const excerpt = escapeHtml(item.excerpt || '')
  const url = buildUrl(type, item.slug)
  const image = getItemImage(item, type)
  const alt = getItemAlt(item)
  const typeLabel = getTypeLabel(type)
  const meta = getItemMeta(item, type)

  return `
    <tr>
      <td style="padding:0 0 16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E7DCC8;background:#FFFFFF;">
          <tr>
            ${
              image
                ? `
            <td width="170" valign="top" style="width:170px;">
              <img
                src="${image}"
                alt="${alt}"
                width="170"
                style="display:block;width:170px;max-width:170px;height:auto;border:0;line-height:100%;"
              />
            </td>`
                : ''
            }
            <td valign="top" style="padding:18px 20px;">
              <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#C8912A;margin:0 0 8px 0;">
                ${escapeHtml(typeLabel)}${meta ? ` · ${escapeHtml(meta)}` : ''}
              </div>
              <div style="font-family:Georgia,serif;font-size:22px;line-height:1.25;color:#5C3D2E;margin:0 0 10px 0;">
                ${title}
              </div>
              ${
                excerpt
                  ? `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#2D1F14;margin:0 0 14px 0;">
                      ${excerpt}
                    </div>`
                  : ''
              }
              <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#5C3D2E;text-decoration:none;">
                Lire la suite →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

function renderSection(
  label: string,
  subtitle: string,
  items: NewsletterItem[],
  type: NewsletterType
) {
  if (!items || items.length === 0) return ''

  const [firstItem, ...otherItems] = items

  return `
    ${sectionTitle(label, subtitle)}
    ${firstItem ? primaryCard(firstItem, type) : ''}
    ${otherItems.map((item) => compactCard(item, type)).join('')}
  `
}

function getHeroImage(
  events: NewsletterItem[],
  posts: NewsletterItem[],
  activities: NewsletterItem[]
) {
  const firstEvent = events.find((item) => item.coverImage?.asset)
  if (firstEvent?.coverImage) return firstEvent.coverImage

  const firstPost = posts.find((item) => item.coverImage?.asset)
  if (firstPost?.coverImage) return firstPost.coverImage

  const firstActivity = activities.find((item) => item.heroImage?.asset || item.coverImage?.asset)
  if (firstActivity?.heroImage) return firstActivity.heroImage
  if (firstActivity?.coverImage) return firstActivity.coverImage

  return null
}

export function generateNewsletterHtml(data: {
  title: string
  intro?: string
  events?: NewsletterItem[]
  posts?: NewsletterItem[]
  activities?: NewsletterItem[]
}) {
  const title = escapeHtml(data.title || 'Newsletter')
  const intro = escapeHtml(data.intro || '')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'
  const events = data.events || []
  const posts = data.posts || []
  const activities = data.activities || []
  const heroImageSource = getHeroImage(events, posts, activities)
  const heroImage = heroImageSource?.asset ? imageUrl(heroImageSource, 1400, 800) || '' : ''
  const heroAlt = escapeHtml(heroImageSource?.alt || title)

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F6F1E8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1E8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0" style="width:100%;max-width:680px;background:#FFFFFF;border-collapse:collapse;">

          <tr>
            <td style="background:#5C3D2E;padding:28px 34px;">
              <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#C8912A;">
                Les Ateliers
              </div>
              <div style="font-family:Georgia,serif;font-size:30px;line-height:1.2;color:#F5EDD8;margin-top:4px;">
                de la Source
              </div>
            </td>
          </tr>

          ${
            heroImage
              ? `
          <tr>
            <td>
              <img
                src="${heroImage}"
                alt="${heroAlt}"
                width="680"
                style="display:block;width:100%;max-width:680px;height:auto;border:0;line-height:100%;"
              />
            </td>
          </tr>`
              : ''
          }

          <tr>
            <td style="padding:40px 34px 28px 34px;background:#FAF6EF;border-bottom:1px solid #E7DCC8;">
              <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C8912A;margin-bottom:12px;">
                Newsletter
              </div>
              <div style="font-family:Georgia,serif;font-size:40px;line-height:1.12;color:#5C3D2E;margin:0 0 16px 0;">
                ${title}
              </div>
              ${
                intro
                  ? `<div style="font-family:Arial,sans-serif;font-size:17px;line-height:1.85;color:#2D1F14;max-width:560px;">
                      ${intro}
                    </div>`
                  : ''
              }
            </td>
          </tr>

          <tr>
            <td style="padding:34px 34px 10px 34px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${renderSection('Événements', 'Les prochains rendez-vous', events, 'event')}
                ${renderSection('Articles', 'À lire et à approfondir', posts, 'post')}
                ${renderSection('Activités', 'Explorer les propositions', activities, 'activity')}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 34px 34px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6EF;border:1px solid #E7DCC8;">
                <tr>
                  <td style="padding:24px;">
                    <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C8912A;margin:0 0 8px 0;">
                      Aller plus loin
                    </div>
                    <div style="font-family:Georgia,serif;font-size:24px;line-height:1.25;color:#5C3D2E;margin:0 0 10px 0;">
                      Explorer le site
                    </div>
                    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#2D1F14;margin:0 0 18px 0;">
                      Retrouvez toutes les actualités, les stages, les événements et les activités sur le site des Ateliers de la Source.
                    </div>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#C8912A;padding:12px 20px;">
                          <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;">
                            Visiter le site →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#F1E7D6;padding:22px 34px;border-top:1px solid #E7DCC8;">
              <div style="font-family:Arial,sans-serif;font-size:12px;line-height:1.8;color:#7A6355;">
                © ${new Date().getFullYear()} Les Ateliers de la Source<br />
                Cet email vous a été envoyé car vous êtes inscrit·e à la newsletter.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
