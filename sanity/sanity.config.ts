import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export default defineConfig({
  name: 'ateliers-source',
  title: 'Les Ateliers de la Source — Contenu',
  basePath: '/studio',
  projectId,
  dataset,

  releases: {
    enabled: false,
  },

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('📂 Gestion du contenu')
          .items([
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

            S.listItem()
              .title('👥 Équipe (Gabriel, Amélie…)')
              .schemaType('person')
              .child(S.documentTypeList('person').title("Membres de l'équipe")),

            S.divider(),

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

            S.listItem()
              .title('📋 Inscriptions reçues')
              .schemaType('memberLead')
              .child(S.documentTypeList('memberLead').title("Demandes d'inscription")),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
})
