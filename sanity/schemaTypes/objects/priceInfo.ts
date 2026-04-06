// sanity/schemaTypes/objects/priceInfo.ts
import { defineType, defineField } from 'sanity'

export const priceInfoObject = defineType({
  name: 'priceInfo',
  title: 'Information de prix',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Libellé', type: 'string', description: 'Ex: "Au chapeau", "Sur devis", "200€"' }),
    defineField({ name: 'amount', title: 'Montant (€)', type: 'number' }),
    defineField({ name: 'note', title: 'Note complémentaire', type: 'string' }),
  ],
})
