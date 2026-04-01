// sanity/sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID'
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production'

export default defineConfig({
  name: 'ateliers-source',
  title: 'Les Ateliers de la Source — CMS',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenu')
          .items([
            S.listItem().title('Paramètres du site').id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.listItem().title('Personnes').schemaType('person').child(S.documentTypeList('person')),
            S.listItem().title('Activités').schemaType('activity').child(S.documentTypeList('activity')),
            S.listItem().title('Stages & Événements').schemaType('event').child(S.documentTypeList('event')),
            S.listItem().title('Articles de blog').schemaType('post').child(S.documentTypeList('post')),
            S.divider(),
            S.listItem().title('Inscriptions (leads)').schemaType('memberLead').child(S.documentTypeList('memberLead')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
