// sanity/schemaTypes/documents/newsletterSettings.ts
import { defineType, defineField } from 'sanity'

export const newsletterSettingsDocument = defineType({
  name: 'newsletterSettings',
  title: 'Newsletter',
  type: 'document',
  icon: () => '📧',
  fields: [
    defineField({
      name: 'provider',
      title: 'Fournisseur',
      type: 'string',
      options: { list: ['mailchimp', 'brevo', 'mailerlite', 'resend', 'autre'] },
      initialValue: 'brevo',
    }),
    defineField({ name: 'apiKey',      title: 'Clé API', type: 'string', description: 'À remplir dans les variables d\'environnement, pas ici.' }),
    defineField({ name: 'listId',      title: 'ID de la liste', type: 'string' }),
    defineField({ name: 'fromName',    title: 'Nom d\'expéditeur', type: 'string', initialValue: 'Les Ateliers de la Source' }),
    defineField({ name: 'fromEmail',   title: 'Email d\'expéditeur', type: 'string', initialValue: 'newsletter@ateliersdelasource.fr' }),
    defineField({
      name: 'enabled',
      title: 'Newsletter activée',
      type: 'boolean',
      initialValue: false,
      description: 'Active le formulaire d\'inscription sur le site.',
    }),
    defineField({
      name: 'welcomeMessage',
      title: 'Message de bienvenue',
      type: 'text',
      rows: 3,
      initialValue: 'Merci de vous être inscrit·e à notre newsletter ! Vous recevrez nos prochains stages, événements et actualités.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Paramètres newsletter' }),
  },
})
