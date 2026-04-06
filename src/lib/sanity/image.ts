// src/lib/sanity/image.ts
import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

const imageBuilder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
})

export const urlForImage = (source: SanityImageSource) => {
  return imageBuilder.image(source).auto('format').fit('max')
}

export const imageUrl = (source: SanityImageSource, width?: number, height?: number) => {
  let builder = imageBuilder.image(source).auto('format')
  if (width) builder = builder.width(width)
  if (height) builder = builder.height(height)
  return builder.url()
}
