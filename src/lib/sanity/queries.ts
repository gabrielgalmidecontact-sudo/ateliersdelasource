// src/lib/sanity/queries.ts
import { groq } from 'next-sanity'

// ─── Fragments réutilisables ─────────────────────────────────

const imageFields = groq`
  _type, asset, alt, caption, hotspot, crop
`

const seoFields = groq`
  title, description, noIndex,
  image { ${imageFields} }
`

const personFields = groq`
  _id, name, slug, role, shortBio, email, order,
  photo { ${imageFields} }
`

const priceFields = groq`label, amount, note`
const durationFields = groq`value, label`

// ─── Site Settings ───────────────────────────────────────────

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteTitle, siteDescription, mainEmail, mainPhone, address,
    heroTitle, heroSubtitle,
    heroImage { ${imageFields} },
    footerText, cyrExternalLink,
    newsletterEnabled, memberAreaEnabled, publicPaymentsEnabled,
    socialLinks,
    seo { ${seoFields} }
  }
`

// ─── Persons ─────────────────────────────────────────────────

export const allPersonsQuery = groq`
  *[_type == "person"] | order(order asc) {
    ${personFields},
    longBio
  }
`

export const personBySlugQuery = groq`
  *[_type == "person" && slug.current == $slug][0] {
    ${personFields}, longBio
  }
`

// ─── Activities ──────────────────────────────────────────────

export const allActivitiesQuery = groq`
  *[_type == "activity" && isPublished == true] | order(homeOrder asc) {
    _id, title, slug, code, excerpt, isPublished, isFeatured, homeOrder,
    coverImage { ${imageFields} },
    duration { ${durationFields} },
    participants,
    price { ${priceFields} },
    owner-> { ${personFields} }
  }
`

export const activityBySlugQuery = groq`
  *[_type == "activity" && slug.current == $slug && isPublished == true][0] {
    _id, title, slug, code, excerpt, content, isPublished, isFeatured,
    coverImage { ${imageFields} },
    gallery[] { ${imageFields} },
    duration { ${durationFields} },
    participants, location,
    price { ${priceFields} },
    ctaLabel, ctaType,
    owner-> { ${personFields} },
    seo { ${seoFields} }
  }
`

export const activitiesByOwnerQuery = groq`
  *[_type == "activity" && isPublished == true && owner->slug.current == $ownerSlug] | order(homeOrder asc) {
    _id, title, slug, code, excerpt,
    coverImage { ${imageFields} },
    duration { ${durationFields} },
    owner-> { ${personFields} }
  }
`

// ─── Events ──────────────────────────────────────────────────

export const allEventsQuery = groq`
  *[_type == "event" && isActive == true] | order(startDate asc) {
    _id, title, slug, type, excerpt, startDate, endDate, location,
    isActive, showOnHomepage, homepageOrder, priceLabel, registrationEnabled,
    coverImage { ${imageFields} },
    owner-> { ${personFields} }
  }
`

export const upcomingEventsQuery = groq`
  *[_type == "event" && isActive == true && startDate >= $now] | order(startDate asc) {
    _id, title, slug, type, excerpt, startDate, endDate, location,
    showOnHomepage, homepageOrder, priceLabel,
    coverImage { ${imageFields} },
    owner-> { ${personFields} }
  }
`

export const homepageEventsQuery = groq`
  *[_type == "event" && isActive == true && showOnHomepage == true] | order(homepageOrder asc, startDate asc) [0...6] {
    _id, title, slug, type, excerpt, startDate, endDate, location, priceLabel,
    coverImage { ${imageFields} },
    owner-> { name, slug }
  }
`

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug && isActive == true][0] {
    _id, title, slug, type, excerpt, description,
    startDate, endDate, location, priceLabel, capacity, registrationEnabled,
    coverImage { ${imageFields} },
    flyerFile { asset->{ url } },
    flyerImage { ${imageFields} },
    externalFlyerUrl,
    owner-> { ${personFields} },
    seo { ${seoFields} }
  }
`

// ─── Blog Posts ───────────────────────────────────────────────

export const allPostsQuery = groq`
  *[_type == "post" && status == "published"] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, status,
    coverImage { ${imageFields} },
    author-> { name, slug, photo { ${imageFields} } }
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug && status == "published"][0] {
    _id, title, slug, excerpt, content, publishedAt,
    coverImage { ${imageFields} },
    author-> { ${personFields} },
    relatedActivities[]-> { _id, title, slug, coverImage { ${imageFields} } },
    relatedEvents[]-> { _id, title, slug, startDate },
    seo { ${seoFields} }
  }
`
