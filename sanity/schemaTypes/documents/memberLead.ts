// sanity/schemaTypes/documents/memberLead.ts
import { defineType, defineField } from 'sanity'

export const memberLeadDocument = defineType({
  name: 'memberLead',
  title: 'Contact membre',
  type: 'document',
  icon: () => '📋',
  fields: [
    defineField({ name: 'firstName', title: 'Prénom', type: 'string' }),
    defineField({ name: 'lastName', title: 'Nom', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Téléphone', type: 'string' }),
    defineField({ name: 'interests', title: 'Centres d\'intérêt', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'newsletterConsent', title: 'Consentement newsletter', type: 'boolean', initialValue: false }),
    defineField({ name: 'source', title: 'Source', type: 'string' }),
    defineField({ name: 'createdAt', title: 'Date de création', type: 'datetime' }),
  ],
  preview: {
    select: { firstName: 'firstName', lastName: 'lastName', email: 'email' },
    prepare: ({ firstName, lastName, email }) => ({
      title: `${firstName || ''} ${lastName || ''}`.trim() || 'Contact sans nom',
      subtitle: email,
    }),
  },
})
