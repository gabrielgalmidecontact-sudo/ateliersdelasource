// sanity/schemaTypes/documents/siteSettings.ts
import { defineType, defineField } from 'sanity'

export const siteSettingsDocument = defineType({
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  icon: () => '⚙️',
  groups: [
    { name: 'general', title: 'Général', default: true },
    { name: 'hero', title: 'Bandeau d\'accueil' },
    { name: 'footer', title: 'Pied de page' },
    { name: 'features', title: 'Fonctionnalités' },
    { name: 'seo', title: 'SEO global' },
  ],
  fields: [
    defineField({ name: 'siteTitle', title: 'Titre du site', type: 'string', group: 'general', initialValue: 'Les Ateliers de la Source' }),
    defineField({ name: 'siteDescription', title: 'Description du site', type: 'text', rows: 3, group: 'general' }),
    defineField({ name: 'mainEmail', title: 'Email principal', type: 'string', group: 'general' }),
    defineField({ name: 'mainPhone', title: 'Téléphone', type: 'string', group: 'general' }),
    defineField({ name: 'address', title: 'Adresse', type: 'text', rows: 3, group: 'general' }),
    defineField({
      name: 'socialLinks', title: 'Réseaux sociaux', type: 'array', group: 'general',
      of: [{
        type: 'object',
        fields: [
          { name: 'platform', type: 'string', title: 'Réseau', options: { list: ['facebook', 'instagram', 'youtube', 'linkedin'] } },
          { name: 'url', type: 'url', title: 'URL' },
        ],
        preview: { select: { title: 'platform', subtitle: 'url' } },
      }],
    }),
    defineField({ name: 'cyrExternalLink', title: 'Lien externe vers le site de Cyr', type: 'url', group: 'general' }),
    // Hero
    defineField({ name: 'heroTitle', title: 'Titre du bandeau', type: 'string', group: 'hero', initialValue: 'Les Ateliers de la Source' }),
    defineField({ name: 'heroSubtitle', title: 'Sous-titre du bandeau', type: 'text', rows: 2, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Image du bandeau', type: 'image', group: 'hero', options: { hotspot: true } }),
    // Footer
    defineField({ name: 'footerText', title: 'Texte du pied de page', type: 'text', rows: 2, group: 'footer' }),
    // Features
    defineField({ name: 'newsletterEnabled', title: 'Newsletter activée', type: 'boolean', group: 'features', initialValue: true }),
    defineField({ name: 'memberAreaEnabled', title: 'Espace membre activé', type: 'boolean', group: 'features', initialValue: false }),
    defineField({ name: 'publicPaymentsEnabled', title: 'Paiements publics activés', type: 'boolean', group: 'features', initialValue: false, description: '⚠️ N\'activer que quand Stripe est complètement configuré.' }),
    // SEO
    defineField({ name: 'seo', title: 'SEO global', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Paramètres du site' }) },
})
