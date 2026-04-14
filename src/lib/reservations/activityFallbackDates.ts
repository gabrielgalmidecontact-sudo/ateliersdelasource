export const ACTIVITY_FALLBACK_DATES: Record<string, string> = {
  'theatre-doubles-karmiques': '2025-06-06',
  'entretien-biographique': '2025-06-15',
  'atelier-expression-parlee-et-corporelle': '2025-06-20',
  'reves-100000-euros': '2025-07-12',
  'vision-dante-victor-hugo': '2025-07-19',
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getActivityFallbackDate(input: {
  slug?: string | null
  title?: string | null
}) {
  const slugKey = input.slug ? normalize(input.slug) : ''
  if (slugKey && ACTIVITY_FALLBACK_DATES[slugKey]) {
    return ACTIVITY_FALLBACK_DATES[slugKey]
  }

  const titleKey = input.title ? normalize(input.title) : ''
  if (titleKey && ACTIVITY_FALLBACK_DATES[titleKey]) {
    return ACTIVITY_FALLBACK_DATES[titleKey]
  }

  return ''
}
