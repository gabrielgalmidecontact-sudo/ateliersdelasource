// sanity/schemaTypes/objects/callToAction.ts
import { defineType, defineField } from 'sanity'

export const callToActionObject = defineType({
  name: 'callToAction',
  title: 'Bouton d\'action (CTA)',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Texte du bouton', type: 'string', validation: Rule => Rule.required() }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { list: ['link', 'contact', 'email', 'phone', 'download'] },
      initialValue: 'link',
    }),
    defineField({ name: 'href', title: 'URL (si type = link)', type: 'string' }),
    defineField({ name: 'email', title: 'Email (si type = email)', type: 'string' }),
    defineField({ name: 'phone', title: 'Téléphone (si type = phone)', type: 'string' }),
    defineField({ name: 'variant', title: 'Style', type: 'string', options: { list: ['primary', 'secondary', 'outline', 'ghost'] }, initialValue: 'primary' }),
  ],
})
