// sanity/schemaTypes/documents/event.ts
import { defineType, defineField } from 'sanity'

export const eventDocument = defineType({
  name: 'event',
  title: 'Stage / Événement',
  type: 'document',
  icon: () => '📅',
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'dates', title: 'Dates & Lieu' },
    { name: 'flyer', title: 'Flyer & Inscription' },
    { name: 'display', title: 'Affichage' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', group: 'content', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Identifiant URL', type: 'slug', group: 'content', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'type', title: 'Type', type: 'string', group: 'content', options: { list: ['Stage', 'Atelier', 'Formation', 'Spectacle', 'Retraite', 'Autre'] } }),
    defineField({ name: 'owner', title: 'Animateur', type: 'reference', to: [{ type: 'person' }], group: 'content' }),
    defineField({ name: 'excerpt', title: 'Extrait', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'description', title: 'Description', type: 'array', group: 'content',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] },
      ],
    }),
    defineField({ name: 'coverImage', title: 'Image principale', type: 'image', group: 'content', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] }),
    // Dates & Lieu
    defineField({ name: 'startDate', title: 'Date de début', type: 'datetime', group: 'dates' }),
    defineField({ name: 'endDate', title: 'Date de fin', type: 'datetime', group: 'dates' }),
    defineField({ name: 'location', title: 'Lieu', type: 'string', group: 'dates' }),
    // Flyer & Inscription
    defineField({ name: 'flyerFile', title: 'Flyer PDF', type: 'file', group: 'flyer', options: { accept: '.pdf' } }),
    defineField({ name: 'flyerImage', title: 'Image du flyer', type: 'image', group: 'flyer', options: { hotspot: true } }),
    defineField({ name: 'externalFlyerUrl', title: 'Lien externe du flyer', type: 'url', group: 'flyer' }),
    defineField({ name: 'priceLabel', title: 'Tarif (texte)', type: 'string', group: 'flyer', description: 'Ex: "350€ repas compris", "Sur devis"' }),
    defineField({ name: 'capacity', title: 'Nombre de places', type: 'number', group: 'flyer' }),
    defineField({ name: 'registrationEnabled', title: 'Inscription activée', type: 'boolean', group: 'flyer', initialValue: false, description: 'Activer uniquement quand le paiement est configuré.' }),
    // Affichage
    defineField({ name: 'isActive', title: 'Actif (visible)', type: 'boolean', group: 'display', initialValue: true }),
    defineField({ name: 'showOnHomepage', title: 'Afficher sur la homepage', type: 'boolean', group: 'display', initialValue: false }),
    defineField({ name: 'homepageOrder', title: 'Ordre sur la homepage', type: 'number', group: 'display', initialValue: 99 }),
    // SEO
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', startDate: 'startDate', media: 'coverImage' },
    prepare: ({ title, startDate, media }) => ({
      title,
      subtitle: startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Date à définir',
      media,
    }),
  },
  orderings: [
    { title: 'Date (proche en premier)', name: 'startDateAsc', by: [{ field: 'startDate', direction: 'asc' }] },
  ],
})
