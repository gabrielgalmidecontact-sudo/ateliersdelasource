// ============================================================
// Types TypeScript — Les Ateliers de la Source
// ============================================================

import type { PortableTextBlock } from '@portabletext/types'

// ─────────────────────────────────────────
// SEO
// ─────────────────────────────────────────
export interface SeoMeta {
  title?: string
  description?: string
  image?: SanityImage
  noIndex?: boolean
}

// ─────────────────────────────────────────
// Images Sanity
// ─────────────────────────────────────────
export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

// ─────────────────────────────────────────
// Hero
// ─────────────────────────────────────────
export interface Hero {
  title: string
  subtitle?: string
  image?: SanityImage
  cta?: CallToAction
}

// ─────────────────────────────────────────
// Call To Action
// ─────────────────────────────────────────
export interface CallToAction {
  label: string
  href?: string
  type: 'link' | 'contact' | 'email' | 'phone'
}

// ─────────────────────────────────────────
// Price Info
// ─────────────────────────────────────────
export interface PriceInfo {
  label?: string
  amount?: number
  currency?: string
  note?: string
}

// ─────────────────────────────────────────
// Duration Info
// ─────────────────────────────────────────
export interface DurationInfo {
  label?: string
  value?: string
}

// ─────────────────────────────────────────
// Person (Gabriel / Amélie)
// ─────────────────────────────────────────
export interface Person {
  _id: string
  _type: 'person'
  name: string
  slug: { current: string }
  role?: string
  shortBio?: string
  longBio?: PortableTextBlock[]
  photo?: SanityImage
  email?: string
  order?: number
  featuredOnHomepage?: boolean
}

// ─────────────────────────────────────────
// Activity (A1–A8)
// ─────────────────────────────────────────
export interface Activity {
  _id: string
  _type: 'activity'
  title: string
  slug: { current: string }
  code?: string               // A1, A2 …
  owner?: Person
  excerpt?: string
  content?: PortableTextBlock[]
  coverImage?: SanityImage
  gallery?: SanityImage[]
  duration?: DurationInfo
  participants?: string
  price?: PriceInfo
  location?: string
  ctaLabel?: string
  ctaType?: 'link' | 'contact' | 'email'
  isPublished?: boolean
  isFeatured?: boolean
  homeOrder?: number
  seo?: SeoMeta
}

// ─────────────────────────────────────────
// Event / Stage / Formation
// ─────────────────────────────────────────
export interface Event {
  _id: string
  _type: 'event'
  title: string
  slug: { current: string }
  type?: string
  excerpt?: string
  description?: PortableTextBlock[]
  coverImage?: SanityImage
  startDate?: string
  endDate?: string
  location?: string
  owner?: Person
  flyerFile?: { asset: { url: string } }
  flyerImage?: SanityImage
  externalFlyerUrl?: string
  showOnHomepage?: boolean
  homepageOrder?: number
  isActive?: boolean
  registrationEnabled?: boolean
  priceLabel?: string
  capacity?: number
  seo?: SeoMeta
}

// ─────────────────────────────────────────
// Blog Post
// ─────────────────────────────────────────
export interface Post {
  _id: string
  _type: 'post'
  title: string
  slug: { current: string }
  excerpt?: string
  coverImage?: SanityImage
  content?: PortableTextBlock[]
  publishedAt?: string
  author?: Person
  relatedActivities?: Activity[]
  relatedEvents?: Event[]
  status?: 'draft' | 'published'
  shareOnSocials?: boolean
  seo?: SeoMeta
}

// ─────────────────────────────────────────
// Site Settings
// ─────────────────────────────────────────
export interface SiteSettings {
  _id: string
  _type: 'siteSettings'
  siteTitle?: string
  siteDescription?: string
  mainEmail?: string
  mainPhone?: string
  address?: string
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: SanityImage
  footerText?: string
  cyrExternalLink?: string
  newsletterEnabled?: boolean
  memberAreaEnabled?: boolean
  publicPaymentsEnabled?: boolean
  socialLinks?: SocialLink[]
  seo?: SeoMeta
}

// ─────────────────────────────────────────
// Social Link
// ─────────────────────────────────────────
export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'twitter'
  url: string
}

// ─────────────────────────────────────────
// Member Lead
// ─────────────────────────────────────────
export interface MemberLead {
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  interests?: string[]
  newsletterConsent: boolean
  source?: string
  createdAt?: string
}

// ─────────────────────────────────────────
// Category
// ─────────────────────────────────────────
export interface Category {
  _id: string
  _type: 'category'
  title: string
  slug: { current: string }
  description?: string
}

// ─────────────────────────────────────────
// Nav Item
// ─────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

// ─────────────────────────────────────────
// Contact Form
// ─────────────────────────────────────────
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

// ─────────────────────────────────────────
// Newsletter Form
// ─────────────────────────────────────────
export interface NewsletterFormData {
  email: string
  firstName?: string
}
