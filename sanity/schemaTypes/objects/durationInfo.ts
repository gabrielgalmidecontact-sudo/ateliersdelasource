// sanity/schemaTypes/objects/durationInfo.ts
import { defineType, defineField } from 'sanity'

export const durationInfoObject = defineType({
  name: 'durationInfo',
  title: 'Durée',
  type: 'object',
  fields: [
    defineField({ name: 'value', title: 'Durée', type: 'string', description: 'Ex: "3 jours et demi", "1h", "1h30"' }),
    defineField({ name: 'label', title: 'Libellé', type: 'string', description: 'Optionnel, remplace "Durée" si renseigné' }),
  ],
})
