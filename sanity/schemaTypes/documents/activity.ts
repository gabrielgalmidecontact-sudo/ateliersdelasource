// sanity/schemaTypes/documents/activity.ts
import { defineType, defineField } from 'sanity'

const ACTIVITY_CODES = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']

export const activityDocument = defineType({
  name: 'activity',
  title: 'Activité',
  type: 'document',
  icon: () => '🌿',
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'infos', title: 'Informations pratiques' },
    { name: 'display', title: 'Affichage' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant URL',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const current = value?.current || ''
          if (!current) return 'Le slug est obligatoire.'
          if (/^https?:\/\//i.test(current)) return 'Le slug ne doit pas être une URL complète.'
          return true
        }),
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      group: 'content',
      description: 'Ex: A1, A2, A3…',
      options: { list: ACTIVITY_CODES },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return 'Le code est obligatoire.'
          if (!ACTIVITY_CODES.includes(value)) return 'Choisis un code entre A1 et A8.'
          return true
        }),
    }),
    defineField({
      name: 'owner',
      title: 'Animateur',
      type: 'reference',
      to: [{ type: 'person' }],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extrait',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Résumé court affiché sur les cartes.',
      validation: (Rule) => Rule.required().min(40).max(240),
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Citation', value: 'blockquote' },
          ],
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Image principale',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }],
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie',
      type: 'array',
      group: 'content',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] }],
    }),
    defineField({ name: 'duration', title: 'Durée', type: 'durationInfo', group: 'infos' }),
    defineField({
      name: 'participants',
      title: 'Participants',
      type: 'string',
      group: 'infos',
      description: 'Ex: "4 à 5 personnes", "Individuel"',
    }),
    defineField({ name: 'price', title: 'Prix', type: 'priceInfo', group: 'infos' }),
    defineField({ name: 'location', title: 'Lieu', type: 'string', group: 'infos' }),
    defineField({ name: 'ctaLabel', title: 'Bouton d\'action — texte', type: 'string', group: 'infos', initialValue: 'Contacter' }),
    defineField({
      name: 'ctaType',
      title: 'Bouton d\'action — type',
      type: 'string',
      group: 'infos',
      options: { list: ['link', 'contact', 'email'] },
      initialValue: 'contact',
    }),
    defineField({ name: 'isPublished', title: 'Publié', type: 'boolean', group: 'display', initialValue: true }),
    defineField({ name: 'isFeatured', title: 'Mis en avant', type: 'boolean', group: 'display', initialValue: false }),
    defineField({ name: 'homeOrder', title: 'Ordre sur la homepage', type: 'number', group: 'display', initialValue: 99 }),
    defineField({
      name: 'shareOnSocials',
      title: 'Partager sur Facebook',
      type: 'boolean',
      group: 'display',
      initialValue: false,
      description: 'Enverra ce contenu au webhook Make / n8n pour publication Facebook.',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'code', media: 'coverImage' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `Code: ${subtitle}` : '',
      media,
    }),
  },
})
