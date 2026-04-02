// sanity/schemaTypes/documents/socialSettings.ts
import { defineType, defineField } from 'sanity'

export const socialSettingsDocument = defineType({
  name: 'socialSettings',
  title: 'Réseaux sociaux',
  type: 'document',
  icon: () => '📱',
  fields: [
    defineField({ name: 'facebookUrl',  title: 'Facebook URL',  type: 'url' }),
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
    defineField({ name: 'youtubeUrl',   title: 'YouTube URL',   type: 'url' }),
    defineField({ name: 'linkedinUrl',  title: 'LinkedIn URL',  type: 'url' }),
    defineField({
      name: 'autoShareEnabled',
      title: 'Partage automatique activé',
      type: 'boolean',
      description: 'Active l\'envoi d\'un webhook Make/n8n lors de la publication d\'un article.',
      initialValue: false,
    }),
    defineField({
      name: 'webhookUrl',
      title: 'URL du webhook (Make / n8n)',
      type: 'url',
      description: 'Remplir uniquement si le partage automatique est activé.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Réseaux sociaux & Partage' }),
  },
})
