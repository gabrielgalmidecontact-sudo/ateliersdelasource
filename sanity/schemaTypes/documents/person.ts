// sanity/schemaTypes/documents/person.ts
import { defineType, defineField } from 'sanity'

export const personDocument = defineType({
  name: 'person',
  title: 'Intervenant',
  type: 'document',
  icon: () => '👤',
  fields: [
    defineField({ name: 'name', title: 'Nom complet', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Identifiant URL', type: 'slug', options: { source: 'name' }, validation: Rule => Rule.required() }),
    defineField({ name: 'role', title: 'Rôle', type: 'string', description: 'Ex: Comédien, Thérapeute, Praticienne…' }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] }),
    defineField({ name: 'shortBio', title: 'Présentation courte', type: 'text', rows: 3, description: 'Affichée sur la homepage.' }),
    defineField({ name: 'longBio', title: 'Biographie complète', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'email', title: 'Email de contact', type: 'string' }),
    defineField({ name: 'order', title: 'Ordre d\'affichage', type: 'number', initialValue: 1 }),
    defineField({ name: 'featuredOnHomepage', title: 'Afficher sur la homepage', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
})
