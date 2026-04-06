// src/app/(public)/activites/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ActivityDetailPage } from '@/features/activites/ActivityDetailPage'

// Static data (CMS-ready)
const activities = [
  {
    code: 'A1',
    title: 'Théâtre des Doubles Karmiques',
    slug: 'theatre-doubles-karmiques',
    owner: { name: 'Gabriel', role: 'Comédien · Thérapeute' },
    excerpt: 'Un processus collectif, conscient et créatif pour désamorcer les mécanismes répétitifs — stages de développement personnel sur 3 jours et demi.',
    content: `Avec un groupe de 4 ou 5 participants, Gabriel vous accompagne dans une immersion profonde au cœur de vous-même.

Le travail s'appuie sur l'exploration d'habitudes parfois tenaces, de comportements anciens ou de situations récurrentes dans notre vie, qui semblent se répéter malgré nous. C'est ce que nous appelons le « Double » : une forme d'ombre intérieure qui nous suit et dont il est difficile de se libérer.

Par exemple :
— « On me reproche toujours d'être monomaniaque, mais je ne peux rien y faire, je suis comme ça. »
— « Je suis toujours en retard quand un rendez-vous est important pour moi, voire je le rate. »
— « Lorsque je m'intéresse à quelqu'un, cette personne est déjà engagée ailleurs. »

À travers un processus collectif, conscient et créatif, nous venons désamorcer ces mécanismes répétitifs. Grâce à des activités de modelage et de mise en scène, le groupe agit comme un miroir : il reflète ce qu'il perçoit et ressent. Cela permet d'apporter de nouveaux éclairages, puis d'ouvrir des pistes de transformation concrètes.

Le troisième jour marque souvent un tournant pour chacun : un renversement intérieur s'opère, le nœud commence à se défaire. Il arrive alors qu'émerge une image archétypale, mise en jeu à travers le théâtre. Cette image, à la fois mystérieuse et profondément transformatrice, peut être qualifiée de « karmique ». Elle semble traverser le temps pour se manifester à travers la personne engagée dans ce travail.

Le dernier jour est consacré au bilan. Chacun repart avec des propositions concrètes à expérimenter dans sa vie quotidienne, afin de poursuivre le processus et permettre aux anciens schémas de se dissoudre durablement.`,
    duration: '3 jours et demi',
    participants: '4 à 5 personnes',
    price: 'Sur devis — contactez Gabriel',
    location: 'Les Ateliers de la Source',
    type: 'Stage',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80',
  },
  {
    code: 'A2',
    title: 'Entretien Biographique',
    slug: 'entretien-biographique',
    owner: { name: 'Gabriel', role: 'Biographe · Thérapeute' },
    excerpt: 'Formé pendant 3 ans à l\'accompagnement biographique avec Cyr Boé, Gabriel vous propose des entretiens d\'environ une heure pour explorer le sens de votre vie.',
    content: `Formé pendant trois ans à l'accompagnement biographique auprès de Cyr Boé, Gabriel vous propose des entretiens d'environ une heure pour explorer le sens de votre vie et mettre en lumière des éléments révélateurs de votre parcours.

Et si votre vie n'était pas une simple succession de hasards ?
Et si elle était, au contraire, conduite par des rythmes précis ?
Existe-t-il une intelligence à l'œuvre dans l'orientation de notre existence ?
Cette intelligence répond-elle à des lois, souvent invisibles au premier regard, mais bien réelles ?

À travers cet accompagnement, nous cherchons à observer, avec recul et objectivité, les rythmes et les dynamiques qui traversent votre vie. Ce travail permet d'ouvrir de nouvelles perspectives et d'aborder l'avenir avec une confiance renouvelée, plus consciente et plus solide.`,
    duration: '1 heure environ',
    participants: 'Individuel',
    price: 'Sur devis — contactez Gabriel',
    location: 'En présentiel ou à distance',
    type: 'Accompagnement',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=80',
  },
  {
    code: 'A3',
    title: 'Atelier d\'Expression Parlée et Corporelle',
    slug: 'atelier-expression-parlee-corporelle',
    owner: { name: 'Gabriel', role: 'Comédien · Pédagogue' },
    excerpt: 'Gagner en aisance corporelle et verbale, pas à pas, pour s\'exprimer comme on veut le dire — dans les yeux, avec le corps, avec justesse.',
    content: `Plus jeune, Gabriel était extrêmement timide. Soutenir le regard de quelqu'un lui était difficile, parler encore davantage… et rire, presque impossible.

C'est à travers le théâtre, la danse et différents stages de développement personnel qu'il a peu à peu cheminé vers une plus grande aisance, jusqu'à trouver une forme de simplicité et de justesse dans l'expression.

Aujourd'hui, il vous accompagne lors de séances d'environ une heure pour développer votre aisance corporelle et verbale : préparation d'un oral, d'une audition, d'un entretien… ou simplement pour retrouver une manière d'être plus libre et plus tranquille au quotidien.

Pas à pas, il devient possible d'exprimer ce que vous souhaitez dire, comme vous souhaitez le dire.

Le travail passe autant par le corps que par la parole. Car lorsque le corps s'ouvre, le verbe s'ajuste, parle… et libère.

« Le verbe par le corps parle juste et libère ! »`,
    duration: '1 heure',
    participants: 'Individuel',
    price: 'Sur devis — contactez Gabriel',
    location: 'Les Ateliers de la Source ou déplacement',
    type: 'Atelier',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1400&q=80',
  },
  {
    code: 'A4',
    title: 'Rêves à 100 000 euros',
    slug: 'reves-100000-euros',
    owner: { name: 'Gabriel (Galmide)', role: 'Comédien · Conteur' },
    excerpt: 'Pendant 7 ans, Galmide a vécu une vie totalement hors norme — déjantée, délurée, touchante et absolument vraie. Un seul en scène semi-improvisé où le public devient complice. Au chapeau.',
    content: `Pendant 7 ans, Galmide a vécu une vie totalement hors norme. Une aventure folle qu'il vous raconte à sa manière : déjantée, délurée, profondément touchante… et pourtant, absolument vraie.

Tout bascule après la perte de sa grand-mère puis de sa mère. Du jour au lendemain, il se retrouve sans travail, sans attaches… mais avec 100 000 euros pour réaliser ses rêves. Et il décide de les vivre, pleinement, sans compromis.

Alors il se lance : il achète un cirque, se retrouve à vivre dans les bois sans eau ni électricité, devient propriétaire d'un éco-jardin… et, en trois ans, a trois enfants avec trois femmes différentes. Le tout, sans tricher.

7 années de vie intense condensées en 1h30 de spectacle. Un seul en scène semi-improvisé, interactif, où le public devient complice de l'histoire.

Sans décor, sans artifices — jouable partout, même dans votre salon. Participation libre, au chapeau.`,
    duration: '1h30',
    participants: 'Tous publics',
    price: 'Au chapeau (participation libre)',
    location: 'Jouable partout, y compris en salon',
    type: 'Spectacle',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&q=80',
  },
  {
    code: 'A5',
    title: 'La Vision de Dante de Victor Hugo',
    slug: 'vision-dante-victor-hugo',
    owner: { name: 'Gabriel (Galmide)', role: 'Comédien · Récitant' },
    excerpt: 'Une immersion poétique à travers l\'œuvre magistrale de Victor Hugo, portée par Galmide et accompagnée d\'une violoncelliste ou pianiste. 1h30. Au chapeau.',
    content: `Galmide vous invite à une immersion poétique à travers La Vision de Dante, œuvre magistrale de Victor Hugo. Pendant 1h30, il donne vie à ce texte puissant, accompagné par une violoncelliste ou une pianiste, pour une expérience à la fois littéraire et musicale.

Dans cette fresque saisissante, Dante, au seuil de la mort, achève son œuvre à travers la voix de Victor Hugo. Se déploie alors une vision grandiose : celle du Jugement de l'Humanité.

Tous les morts — humbles et puissants, innocents et coupables — sont appelés à comparaître devant Dieu et ses anges. Dans cet au-delà où rien ne peut être dissimulé, chaque existence est révélée dans sa vérité la plus nue.

Victimes, soldats, capitaines, juges, rois, papes… tous font face à une justice implacable, universelle.

Un moment suspendu, où la poésie devient souffle, et la parole, révélation. Sans décor, sans artifices — ce spectacle peut se jouer partout, même dans l'intimité de votre salon.

Participation libre, au chapeau.`,
    duration: '1h30',
    participants: 'Tous publics',
    price: 'Au chapeau (participation libre)',
    location: 'Jouable partout, y compris en salon',
    type: 'Spectacle',
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1400&q=80',
  },
  {
    code: 'A6',
    title: 'Massages & Soins',
    slug: 'massages-soins',
    owner: { name: 'Amélie', role: 'Praticienne' },
    excerpt: 'Amélie vous accueille dans son espace de soins corporels. Les détails de ses propositions seront disponibles prochainement.',
    content: `Amélie vous accueille dans son espace dédié aux soins corporels.

Ses propositions détaillées seront disponibles prochainement, dès l'ouverture de sa salle (prévue début juin).

En attendant, n'hésitez pas à la contacter directement pour toute question.`,
    duration: 'À définir',
    participants: 'Individuel',
    price: 'À définir',
    location: 'Les Ateliers de la Source',
    type: 'Soin',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=80',
    placeholder: true,
  },
  {
    code: 'A7',
    title: 'Hébergement sur le lieu',
    slug: 'hebergement',
    owner: { name: 'Amélie', role: 'Hôte' },
    excerpt: 'Informations pour réserver votre nuit ou votre séjour sur le lieu. Contenu à venir prochainement.',
    content: `Informations pratiques pour réserver votre hébergement sur le lieu.

Contenu disponible prochainement — contactez-nous pour toute question.`,
    duration: 'Variable',
    participants: 'À définir',
    price: 'À définir',
    location: 'Les Ateliers de la Source',
    type: 'Hébergement',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&q=80',
    placeholder: true,
  },
  {
    code: 'A8',
    title: 'Venir sur le lieu',
    slug: 'venir-sur-le-lieu',
    owner: { name: 'Amélie', role: 'Hôte' },
    excerpt: 'Accès, itinéraire et informations pratiques pour rejoindre les Ateliers de la Source.',
    content: `Accès, itinéraire et informations pratiques pour rejoindre les Ateliers de la Source.

Contenu disponible prochainement — contactez-nous pour toute question.`,
    duration: '—',
    participants: '—',
    price: '—',
    location: 'Les Ateliers de la Source',
    type: 'Informations',
    imageUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=1400&q=80',
    placeholder: true,
  },
]

export async function generateStaticParams() {
  return activities.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const activity = activities.find(a => a.slug === slug)
  if (!activity) return { title: 'Activité introuvable' }
  return {
    title: activity.title,
    description: activity.excerpt,
  }
}

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const activity = activities.find(a => a.slug === slug)
  if (!activity) notFound()
  return <ActivityDetailPage activity={activity} allActivities={activities} />
}
