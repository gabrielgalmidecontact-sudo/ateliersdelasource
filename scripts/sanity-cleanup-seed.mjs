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

function block(text, style = 'normal') {
  return {
    _type: 'block',
    style,
    children: [
      {
        _type: 'span',
        text,
        marks: [],
      },
    ],
    markDefs: [],
  }
}

const GABRIEL_ID = 'person-gabriel-galmide'
const AMELIE_ID = 'person-amelie'
const SITE_SETTINGS_ID = 'siteSettings'

const deleteIds = [
  '0407a3fe-c6ee-463a-900e-3391e0d40f6d',
  'b40bd5fe-4a78-4243-adbc-ac3cd4b55f48',
  'a64d98d0-c777-437a-b4be-14f69c0f082e',
  'b669c3fe-0174-4fc5-a6bb-73b44bb27f88',
  '5f238b18-78fb-4b14-9925-df394f22bcdc',
  'e0f327f4-e8ce-4caa-be9a-e082d27af44b',
]

const gabriel = {
  _id: GABRIEL_ID,
  _type: 'person',
  name: 'Gabriel Galmide',
  slug: { _type: 'slug', current: 'gabriel-galmide' },
  role: 'Comédien · Thérapeute',
  shortBio:
    "Comédien et animateur de stages de développement personnel, Gabriel vous accompagne dans une exploration de vous-même à travers le théâtre, la biographie et l'expression. Un chemin humain, créatif et profond.",
  email: 'gabrielgalmide.contact@gmail.com',
  order: 1,
  featuredOnHomepage: true,
}

const amelie = {
  _id: AMELIE_ID,
  _type: 'person',
  name: 'Amélie',
  slug: { _type: 'slug', current: 'amelie' },
  role: 'Praticienne · Hôte du lieu',
  shortBio:
    "Amélie vous accueille dans cet espace de douceur et de ressourcement. Elle propose des soins corporels et des informations pratiques pour votre séjour sur le lieu. Ses offres pourront être détaillées progressivement dans le CMS.",
  order: 2,
  featuredOnHomepage: true,
}

const siteSettings = {
  _id: SITE_SETTINGS_ID,
  _type: 'siteSettings',
  siteTitle: 'Les Ateliers de la Source',
  siteDescription:
    "Stages de développement personnel, ateliers d'expression, spectacles et accompagnements dans un lieu de nature, de création et de transformation.",
  mainEmail: 'gabrielgalmide.contact@gmail.com',
  mainPhone: '',
  address: '',
  heroTitle: 'Les Ateliers\nde la Source',
  heroSubtitle:
    'Un lieu de ressourcement, de création et de transformation. Des propositions humaines, profondes et vivantes.',
  footerText:
    'Les Ateliers de la Source — stages, ateliers, spectacles et accompagnements dans un lieu de nature.',
  newsletterEnabled: true,
  memberAreaEnabled: true,
  publicPaymentsEnabled: false,
}

const activities = [
  {
    _id: 'activity-a1',
    _type: 'activity',
    title: 'Théâtre des Doubles Karmiques',
    slug: { _type: 'slug', current: 'theatre-des-doubles-karmiques' },
    code: 'A1',
    owner: { _type: 'reference', _ref: GABRIEL_ID },
    excerpt:
      "Stage de développement personnel sur 3 jours et demi, en petit groupe, pour identifier et transformer des schémas répétitifs à travers un processus collectif, conscient et créatif.",
    content: [
      block("Avec un groupe de 4 à 5 personnes, Gabriel vous accompagne dans une immersion au cœur de vous-même."),
      block("Le travail part d'habitudes ancrées, de comportements anciens ou de situations récurrentes qui semblent se répéter malgré nous. C’est ce que nous appelons le « Double » : une forme d’ombre intérieure dont il est difficile de se libérer."),
      block("À travers des activités de modelage et de mise en scène, le groupe agit comme un miroir : il reflète ce qu’il perçoit et ressent, apporte de nouveaux éclairages et ouvre des pistes de transformation concrètes."),
      block("Le troisième jour marque souvent un tournant : un renversement intérieur s’opère et le nœud commence à se défaire. Une image archétypale peut alors émerger et être mise en jeu à travers le théâtre."),
      block("Le dernier jour est consacré au bilan. Chacun repart avec des propositions concrètes à expérimenter dans sa vie quotidienne pour poursuivre le processus et permettre aux anciens schémas de se dissoudre durablement."),
    ],
    duration: { _type: 'durationInfo', value: '3 jours et demi' },
    participants: '4 à 5 personnes',
    price: { _type: 'priceInfo', label: 'Sur demande' },
    location: 'Les Ateliers de la Source',
    ctaLabel: 'Contacter Gabriel',
    ctaType: 'contact',
    isPublished: true,
    isFeatured: true,
    homeOrder: 1,
  },
  {
    _id: 'activity-a2',
    _type: 'activity',
    title: 'Entretien Biographique',
    slug: { _type: 'slug', current: 'entretien-biographique' },
    code: 'A2',
    owner: { _type: 'reference', _ref: GABRIEL_ID },
    excerpt:
      "Entretien individuel d’environ une heure pour explorer le sens de votre vie, éclairer votre parcours et observer les rythmes et lois qui traversent votre existence.",
    content: [
      block("Gabriel s’est formé pendant trois ans à l’accompagnement biographique auprès de Cyr Boé."),
      block("Il vous propose des entretiens d’environ une heure pour explorer le sens de votre vie et mettre en lumière des éléments révélateurs de votre parcours."),
      block("Cet accompagnement invite à observer, avec recul et objectivité, les rythmes et les dynamiques qui traversent votre existence."),
      block("L’entretien permet de faire des liens entre événements passés et présents, d’ouvrir de nouvelles perspectives et d’aborder l’avenir avec une confiance renouvelée, plus consciente et plus solide."),
    ],
    duration: { _type: 'durationInfo', value: '1 heure' },
    participants: 'Individuel',
    price: { _type: 'priceInfo', label: 'Sur demande' },
    location: 'À définir',
    ctaLabel: 'Contacter Gabriel',
    ctaType: 'contact',
    isPublished: true,
    isFeatured: false,
    homeOrder: 2,
  },
  {
    _id: 'activity-a3',
    _type: 'activity',
    title: "Atelier d'expression parlée et corporelle",
    slug: { _type: 'slug', current: 'atelier-expression-parlee-et-corporelle' },
    code: 'A3',
    owner: { _type: 'reference', _ref: GABRIEL_ID },
    excerpt:
      "Séances individuelles d’environ une heure pour développer l’aisance corporelle et verbale, préparer un oral, une audition, un entretien ou simplement retrouver une expression plus libre au quotidien.",
    content: [
      block("À partir de son propre chemin — théâtre, danse, stages de développement personnel — Gabriel accompagne celles et ceux qui souhaitent gagner en aisance corporelle et verbale."),
      block("Le travail passe autant par le corps que par la parole : lorsque le corps s’ouvre, le verbe s’ajuste, parle juste et libère."),
      block("Ces séances d’environ une heure peuvent être utiles pour préparer un oral, une audition, un entretien, une rencontre importante ou simplement retrouver une manière d’être plus libre et plus tranquille au quotidien."),
      block("Pas à pas, il devient possible d’exprimer ce que l’on souhaite dire, comme on souhaite le dire."),
    ],
    duration: { _type: 'durationInfo', value: '1 heure' },
    participants: 'Individuel',
    price: { _type: 'priceInfo', label: 'Sur demande' },
    location: 'À définir',
    ctaLabel: 'Contacter Gabriel',
    ctaType: 'contact',
    isPublished: true,
    isFeatured: false,
    homeOrder: 3,
  },
  {
    _id: 'activity-a4',
    _type: 'activity',
    title: 'Rêves à 100 000 euros',
    slug: { _type: 'slug', current: 'reves-a-100-000-euros' },
    code: 'A4',
    owner: { _type: 'reference', _ref: GABRIEL_ID },
    excerpt:
      "Un seul-en-scène semi-improvisé, interactif et touchant, où Galmide raconte sept années de vie hors norme en 1h30. Un spectacle jouable partout, même dans un salon.",
    content: [
      block("Pendant sept ans, Galmide a vécu une vie totalement hors norme. Cette aventure folle est racontée sur scène à sa manière : déjantée, délurée, profondément touchante — et pourtant absolument vraie."),
      block("À la suite de plusieurs deuils, il se retrouve sans travail, sans attaches, mais avec 100 000 euros pour vivre ses rêves à fond. Il achète un cirque, vit dans les bois sans eau ni électricité, devient propriétaire d’un éco-jardin, et traverse une vie rocambolesque."),
      block("Le spectacle condense ces sept années en 1h30 dans une forme semi-improvisée, où le public devient complice de l’histoire."),
      block("Sans décor ni artifices, il peut se jouer partout, même dans l’intimité d’un salon."),
    ],
    duration: { _type: 'durationInfo', value: '1h30' },
    participants: 'Tous publics',
    price: { _type: 'priceInfo', label: 'Au chapeau' },
    location: 'Jouable partout',
    ctaLabel: 'Contacter Gabriel',
    ctaType: 'contact',
    isPublished: true,
    isFeatured: false,
    homeOrder: 4,
  },
  {
    _id: 'activity-a5',
    _type: 'activity',
    title: 'La Vision de Dante de Victor Hugo',
    slug: { _type: 'slug', current: 'la-vision-de-dante-de-victor-hugo' },
    code: 'A5',
    owner: { _type: 'reference', _ref: GABRIEL_ID },
    excerpt:
      "Une récitation poétique et vivante de La Vision de Dante de Victor Hugo, pendant 1h30, accompagnée d’une violoncelliste ou d’une pianiste.",
    content: [
      block("Galmide vous invite à une immersion poétique à travers La Vision de Dante, œuvre magistrale de Victor Hugo."),
      block("Pendant 1h30, il donne vie à ce texte puissant, accompagné d’une violoncelliste ou d’une pianiste, pour une expérience à la fois littéraire et musicale."),
      block("Dans cette fresque saisissante, Dante, au seuil de la mort, achève son œuvre à travers la voix de Victor Hugo. Se déploie alors une vision grandiose : celle du Jugement de l’Humanité."),
      block("Sans décor ni artifices, ce spectacle peut se jouer partout, même dans l’intimité d’un salon."),
    ],
    duration: { _type: 'durationInfo', value: '1h30' },
    participants: 'Tous publics',
    price: { _type: 'priceInfo', label: 'Au chapeau' },
    location: 'Jouable partout',
    ctaLabel: 'Contacter Gabriel',
    ctaType: 'contact',
    isPublished: true,
    isFeatured: false,
    homeOrder: 5,
  },
]

async function exists(id) {
  return client.fetch(`defined(*[_id == $id][0]._id)`, { id })
}

async function main() {
  for (const id of deleteIds) {
    if (await exists(id)) {
      await client.delete(id)
      console.log(`Deleted ${id}`)
    }
  }

  await client.createOrReplace(gabriel)
  console.log('Upserted Gabriel')

  await client.createOrReplace(amelie)
  console.log('Upserted Amélie')

  await client.createOrReplace(siteSettings)
  console.log('Upserted siteSettings')

  for (const activity of activities) {
    await client.createOrReplace(activity)
    console.log(`Upserted ${activity.code} - ${activity.title}`)
  }

  console.log('Sanity cleanup + seed completed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
