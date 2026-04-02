// sanity/sanity.config.ts
// Configuration Sanity Studio pour Les Ateliers de la Source
// Accessible sur /studio — réservé à Gabriel (admin)
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID'
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production'

export default defineConfig({
  name: 'ateliers-source',
  title: 'Les Ateliers de la Source — Contenu',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('📂 Gestion du contenu')
          .items([
            // Paramètres globaux (singleton)
            S.listItem()
              .title('⚙️ Paramètres du site')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Paramètres globaux')
              ),

            S.divider(),

            // Équipe
            S.listItem()
              .title('👥 Équipe (Gabriel, Amélie…)')
              .schemaType('person')
              .child(S.documentTypeList('person').title('Membres de l\'équipe')),

            S.divider(),

            // Contenu principal
            S.listItem()
              .title('🎭 Activités')
              .schemaType('activity')
              .child(S.documentTypeList('activity').title('Toutes les activités')),

            S.listItem()
              .title('📅 Stages & Événements')
              .schemaType('event')
              .child(S.documentTypeList('event').title('Tous les stages et événements')),

            S.listItem()
              .title('📝 Articles de blog')
              .schemaType('post')
              .child(S.documentTypeList('post').title('Tous les articles')),

            S.divider(),

            // Inscriptions
            S.listItem()
              .title('📋 Inscriptions reçues')
              .schemaType('memberLead')
              .child(S.documentTypeList('memberLead').title('Demandes d\'inscription')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
