// sanity/schemaTypes/index.ts
import { personDocument } from './documents/person'
import { activityDocument } from './documents/activity'
import { eventDocument } from './documents/event'
import { postDocument } from './documents/post'
import { siteSettingsDocument } from './documents/siteSettings'
import { memberLeadDocument } from './documents/memberLead'
import { socialSettingsDocument } from './documents/socialSettings'
import { newsletterSettingsDocument } from './documents/newsletterSettings'
import { seoObject } from './objects/seo'
import { portableTextObject } from './objects/portableText'
import { priceInfoObject } from './objects/priceInfo'
import { durationInfoObject } from './objects/durationInfo'
import { callToActionObject } from './objects/callToAction'
import { mediaAssetObject } from './objects/mediaAsset'

export const schemaTypes = [
  // Documents
  personDocument,
  activityDocument,
  eventDocument,
  postDocument,
  siteSettingsDocument,
  memberLeadDocument,
  socialSettingsDocument,
  newsletterSettingsDocument,
  // Objects
  seoObject,
  portableTextObject,
  priceInfoObject,
  durationInfoObject,
  callToActionObject,
  mediaAssetObject,
]
