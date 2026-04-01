// sanity/schemaTypes/objects/mediaAsset.ts
import { defineType, defineField } from 'sanity'

export const mediaAssetObject = defineType({
  name: 'mediaAsset',
  title: 'Média',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Texte alternatif', type: 'string', validation: Rule => Rule.required() }),
        defineField({ name: 'caption', title: 'Légende', type: 'string' }),
      ],
    }),
    defineField({ name: 'videoUrl', title: 'URL vidéo (YouTube / Vimeo)', type: 'url' }),
  ],
})
