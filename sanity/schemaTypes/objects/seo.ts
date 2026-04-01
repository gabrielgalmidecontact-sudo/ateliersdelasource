// sanity/schemaTypes/objects/seo.ts
import { defineType, defineField } from 'sanity'

export const seoObject = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Titre SEO', type: 'string', description: 'Laissez vide pour utiliser le titre de la page.' }),
    defineField({ name: 'description', title: 'Description SEO', type: 'text', rows: 3 }),
    defineField({ name: 'image', title: 'Image de partage', type: 'image' }),
    defineField({ name: 'noIndex', title: 'Masquer des moteurs de recherche', type: 'boolean', initialValue: false }),
  ],
})
