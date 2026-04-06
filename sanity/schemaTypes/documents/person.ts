// sanity/schemaTypes/documents/person.ts
import { defineType, defineField } from 'sanity'

export const personDocument = defineType({
  name: 'person',
  title: 'Intervenant',
  type: 'document',
  icon: () => '👤',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom complet',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant URL',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const current = value?.current || ''
          if (!current) return 'Le slug est obligatoire.'
          if (/^https?:\/\//i.test(current)) return 'Le slug ne doit pas être une URL complète.'
          return true
        }),
    }),
    defineField({
      name: 'role',
      title: 'Rôle',
      type: 'string',
      description: 'Ex: Comédien · Thérapeute, Praticienne · Hôte du lieu…',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
    }),
    defineField({
      name: 'shortBio',
      title: 'Présentation courte',
      type: 'text',
      rows: 4,
      description: 'Affichée sur la homepage.',
      validation: (Rule) => Rule.required().min(30),
    }),
    defineField({ name: 'longBio', title: 'Biographie complète', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'email', title: 'Email de contact', type: 'email' }),
    defineField({ name: 'order', title: 'Ordre d\'affichage', type: 'number', initialValue: 1 }),
    defineField({ name: 'featuredOnHomepage', title: 'Afficher sur la homepage', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
})
