import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const outFile = path.join('backups', `sanity-backup-${stamp}.json`)

const queries = {
  persons: `*[_type == "person"] | order(order asc){...}`,
  activities: `*[_type == "activity"] | order(homeOrder asc){...}`,
  events: `*[_type == "event"] | order(homepageOrder asc,startDate asc){...}`,
  posts: `*[_type == "post"] | order(publishedAt desc){...}`,
  siteSettings: `*[_type == "siteSettings"]{...}`,
  newsletterSettings: `*[_type == "newsletterSettings"]{...}`,
  socialSettings: `*[_type == "socialSettings"]{...}`,
}

const result = {}
for (const [key, query] of Object.entries(queries)) {
  result[key] = await client.fetch(query)
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8')
console.log(`Backup written to ${outFile}`)
