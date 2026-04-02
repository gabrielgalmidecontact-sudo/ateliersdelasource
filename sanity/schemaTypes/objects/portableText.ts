// sanity/schemaTypes/objects/portableText.ts
import { defineType, defineField } from 'sanity'

export const portableTextObject = defineType({
  name: 'portableText',
  title: 'Contenu riche',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Titre H2', value: 'h2' },
        { title: 'Titre H3', value: 'h3' },
        { title: 'Citation', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Lien',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              { name: 'blank', type: 'boolean', title: 'Ouvrir dans un nouvel onglet' },
            ],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Texte alternatif' }),
        defineField({ name: 'caption', type: 'string', title: 'Légende' }),
      ],
    },
  ],
})
