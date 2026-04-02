// sanity/schemaTypes/documents/post.ts
import { defineType, defineField } from 'sanity'

export const postDocument = defineType({
  name: 'post',
  title: 'Article de blog',
  type: 'document',
  icon: () => '✍️',
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'meta', title: 'Métadonnées' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', group: 'content', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Identifiant URL', type: 'slug', group: 'content', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'coverImage', title: 'Image principale', type: 'image', group: 'content', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] }),
    defineField({ name: 'excerpt', title: 'Extrait', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'content', title: 'Contenu', type: 'array', group: 'content',
      of: [
        { type: 'block', styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'Citation', value: 'blockquote' },
        ]},
        { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texte alternatif' }] },
      ],
    }),
    // Meta
    defineField({ name: 'publishedAt', title: 'Date de publication', type: 'datetime', group: 'meta' }),
    defineField({ name: 'author', title: 'Auteur', type: 'reference', to: [{ type: 'person' }], group: 'meta' }),
    defineField({ name: 'status', title: 'Statut', type: 'string', group: 'meta', options: { list: ['draft', 'published'], layout: 'radio' }, initialValue: 'draft' }),
    defineField({ name: 'shareOnSocials', title: 'Partager sur les réseaux', type: 'boolean', group: 'meta', initialValue: false }),
    defineField({ name: 'relatedActivities', title: 'Activités liées', type: 'array', group: 'meta', of: [{ type: 'reference', to: [{ type: 'activity' }] }] }),
    defineField({ name: 'relatedEvents', title: 'Événements liés', type: 'array', group: 'meta', of: [{ type: 'reference', to: [{ type: 'event' }] }] }),
    // SEO
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', status: 'status', media: 'coverImage' },
    prepare: ({ title, status, media }) => ({
      title,
      subtitle: status === 'published' ? '✅ Publié' : '⏳ Brouillon',
      media,
    }),
  },
})
