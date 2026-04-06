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
    children: [{ _type: 'span', text, marks: [] }],
    markDefs: [],
  }
}

const GABRIEL_ID = 'person-gabriel-galmide'

const posts = [
  {
    _id: 'post-le-double-ombre',
    _type: 'post',
    title: 'Le Double : cette ombre qui nous suit',
    slug: { _type: 'slug', current: 'le-double-cette-ombre-qui-nous-suit' },
    excerpt:
      "Pourquoi certaines situations semblent-elles se répéter malgré nous ? Une introduction au travail du Double et à l'expérience vécue pendant le stage Théâtre des Doubles Karmiques.",
    publishedAt: '2026-04-06T18:00:00.000Z',
    author: { _type: 'reference', _ref: GABRIEL_ID },
    status: 'published',
    shareOnSocials: false,
    relatedActivities: [{ _type: 'reference', _ref: 'activity-a1' }],
    content: [
      block("Il y a des situations qui reviennent dans nos vies avec une régularité troublante. Un rendez-vous important que l’on rate. Une relation qui échoue toujours au même endroit. Une habitude que l’on croyait avoir dépassée et qui revient, encore."),
      block("Dans le travail proposé aux Ateliers de la Source, nous appelons cela le « Double » : une forme d’ombre intérieure, parfois ancienne, qui semble nous suivre et rejouer certains mécanismes malgré nous."),
      block("Le stage Théâtre des Doubles Karmiques ne consiste pas à expliquer cette répétition de manière abstraite. Il s’agit de la voir à l’œuvre, de la nommer, de l’affronter, puis de la transformer."),
      block("Le groupe joue ici un rôle essentiel. À travers le modelage, l’observation, la mise en scène et l’écho sensible des autres participants, quelque chose se révèle. Ce qui était flou devient visible. Ce qui paraissait inévitable commence à se desserrer."),
      block("Souvent, un retournement se vit au cours du travail. Une image nouvelle surgit, plus libre, plus profonde, parfois inattendue. Elle ouvre un passage là où l’on se croyait enfermé."),
      block("Ce chemin n’est pas théorique. Il est vécu, concret, parfois émouvant, et se prolonge ensuite dans la vie quotidienne par des propositions simples à expérimenter."),
      block("Il ne s’agit pas de devenir quelqu’un d’autre. Il s’agit plutôt de cesser d’être prisonnier de ce qui se rejoue malgré soi."),
    ],
  },
  {
    _id: 'post-vie-pas-hasard',
    _type: 'post',
    title: "Et si votre vie n'était pas un hasard ?",
    slug: { _type: 'slug', current: 'et-si-votre-vie-n-etait-pas-un-hasard' },
    excerpt:
      "L’entretien biographique propose de relire son parcours avec davantage de recul, afin d’identifier les rythmes, les lois et les correspondances qui traversent une existence.",
    publishedAt: '2026-04-07T08:30:00.000Z',
    author: { _type: 'reference', _ref: GABRIEL_ID },
    status: 'published',
    shareOnSocials: false,
    relatedActivities: [{ _type: 'reference', _ref: 'activity-a2' }],
    content: [
      block("Nous avons souvent l’impression que notre vie avance au hasard : des rencontres imprévues, des ruptures, des épreuves, des élans soudains, des changements de direction."),
      block("Et pourtant, lorsque l’on prend le temps de regarder son parcours avec attention, certaines lignes apparaissent. Des répétitions, des cycles, des périodes, des questions récurrentes. Comme si une forme de cohérence plus subtile était à l’œuvre."),
      block("L’entretien biographique est un espace pour cela : se poser, relire, mettre des mots, faire des liens entre le passé et le présent."),
      block("Ce travail ne cherche pas à plaquer une théorie sur une existence. Il part du réel : de votre histoire, de vos événements, de vos bifurcations, de vos blessures, de vos ressources."),
      block("Peu à peu, une autre lecture devient possible. Non pas une lecture figée, mais une compréhension plus vivante de ce qui vous traverse et de ce qui cherche peut-être à se déployer dans votre vie."),
      block("Lorsque nous percevons mieux les rythmes qui nous habitent, l’avenir cesse d’être un brouillard total. Il devient un espace dans lequel il est possible d’avancer avec davantage de confiance, de discernement et de force."),
      block("La biographie n’efface pas le mystère d’une vie. Elle permet simplement de l’approcher avec plus de conscience."),
    ],
  },
  {
    _id: 'post-corps-parle-avant-mots',
    _type: 'post',
    title: 'Le corps parle avant les mots',
    slug: { _type: 'slug', current: 'le-corps-parle-avant-les-mots' },
    excerpt:
      "Avant même de parler, le corps dit quelque chose. Travailler l’expression parlée et corporelle, c’est retrouver une parole plus juste, plus libre et plus incarnée.",
    publishedAt: '2026-04-08T08:30:00.000Z',
    author: { _type: 'reference', _ref: GABRIEL_ID },
    status: 'published',
    shareOnSocials: false,
    relatedActivities: [{ _type: 'reference', _ref: 'activity-a3' }],
    content: [
      block("Beaucoup de personnes pensent avoir un problème de parole, alors que la difficulté commence souvent ailleurs : dans le corps, dans le souffle, dans le regard, dans la manière d’habiter sa présence."),
      block("Le corps parle avant les mots. Il annonce déjà quelque chose de notre état intérieur : tension, retrait, peur, élan, disponibilité, fermeture, sincérité."),
      block("C’est pour cette raison qu’un travail d’expression réellement transformateur ne peut pas se limiter à “bien parler”. Il s’agit aussi de se redresser intérieurement, de se sentir plus présent, plus libre, plus simple."),
      block("Préparer un oral, une audition, un entretien ou une rencontre importante demande parfois moins de technique que d’alignement. Lorsque le corps s’ouvre, le verbe s’ajuste. La parole devient plus juste, plus vivante, moins forcée."),
      block("Ce chemin est particulièrement précieux pour les personnes timides, impressionnables, ou qui ont appris très tôt à se contenir."),
      block("L’objectif n’est pas de devenir spectaculaire. L’objectif est de devenir plus vrai dans sa manière de parler, de regarder, d’être là."),
      block("L’expression n’est pas seulement une compétence. Elle peut devenir un véritable outil de liberté."),
    ],
  },
  {
    _id: 'post-vivre-ses-reves-jusqu-au-bout',
    _type: 'post',
    title: 'Vivre ses rêves jusqu’au bout : folie ou nécessité ?',
    slug: { _type: 'slug', current: 'vivre-ses-reves-jusqu-au-bout-folie-ou-necessite' },
    excerpt:
      "À partir du spectacle Rêves à 100 000 euros, un article sur le désir, le risque, la liberté et cette question brûlante : que faisons-nous vraiment de la vie qui nous est donnée ?",
    publishedAt: '2026-04-09T08:30:00.000Z',
    author: { _type: 'reference', _ref: GABRIEL_ID },
    status: 'published',
    shareOnSocials: false,
    relatedActivities: [{ _type: 'reference', _ref: 'activity-a4' }],
    content: [
      block("Il y a des périodes de vie où tout vacille : les repères tombent, les liens changent, les certitudes s’effondrent. Et parfois, dans cet espace déstabilisé, une autre question surgit : qu’est-ce que j’ai vraiment envie de vivre ?"),
      block("Rêves à 100 000 euros part de cette bascule. Une histoire vraie, improbable, excessive, drôle, touchante — celle d’un homme qui décide de ne plus remettre ses élans essentiels à plus tard."),
      block("Acheter un cirque. Vivre dans les bois. Créer autrement. Aimer autrement. Tout cela peut sembler déraisonnable. Pourtant, derrière l’excès apparent, une question demeure profondément humaine : à quel moment accepte-t-on enfin d’habiter sa propre vie ?"),
      block("Le spectacle ne donne pas une morale. Il ne dit pas qu’il faudrait tout plaquer. Il met simplement le projecteur sur une intensité d’existence qui nous interroge."),
      block("Combien de désirs avons-nous enterrés sous le raisonnable, le prudent, le “plus tard”, le “ce n’est pas sérieux” ?"),
      block("Parfois, la folie n’est pas dans le fait d’oser. Elle est dans le fait de s’éloigner trop longtemps de ce qui nous appelle profondément."),
      block("Ce spectacle, à sa manière libre et déjantée, rappelle que vivre pleinement n’est pas toujours confortable — mais que renoncer à vivre peut coûter bien davantage."),
    ],
  },
  {
    _id: 'post-poesie-justice-interieure',
    _type: 'post',
    title: 'Quand la poésie devient jugement intérieur',
    slug: { _type: 'slug', current: 'quand-la-poesie-devient-jugement-interieur' },
    excerpt:
      "À travers La Vision de Dante de Victor Hugo, la parole poétique ne raconte pas seulement une scène : elle révèle, expose et met chacun face à une forme de vérité.",
    publishedAt: '2026-04-10T08:30:00.000Z',
    author: { _type: 'reference', _ref: GABRIEL_ID },
    status: 'published',
    shareOnSocials: false,
    relatedActivities: [{ _type: 'reference', _ref: 'activity-a5' }],
    content: [
      block("La poésie est parfois perçue comme un art délicat, contemplatif, presque lointain. Et pourtant, certains textes frappent avec une force rare. Ils ne se contentent pas d’être beaux : ils mettent en mouvement, ils dévoilent, ils jugent."),
      block("C’est ce qui se joue dans La Vision de Dante de Victor Hugo. À travers cette grande fresque, quelque chose de l’humanité entière se retrouve convoqué."),
      block("Les humbles, les puissants, les victimes, les soldats, les rois, les juges, les papes : tous apparaissent sous une même lumière. Rien ne peut être caché. Rien ne peut se maquiller."),
      block("Ce qui touche alors, ce n’est pas seulement la grandeur du texte. C’est la sensation que la parole poétique devient un lieu de vérité."),
      block("Écouter un tel texte, c’est parfois sentir en soi un jugement plus intérieur que moral. Une mise à nu. Une question silencieuse : qu’est-ce qui, dans ma propre vie, demande à être vu avec plus de vérité ?"),
      block("Lorsqu’elle est portée par une voix vivante et soutenue par la musique, la poésie cesse d’être un objet littéraire. Elle redevient souffle, présence, traversée."),
      block("Et peut-être est-ce là sa puissance la plus profonde : non pas nous divertir du réel, mais nous reconduire à lui avec davantage d’intensité."),
    ],
  },
]

async function main() {
  for (const post of posts) {
    await client.createOrReplace(post)
    console.log(`Upserted blog post: ${post.title}`)
  }
  console.log('Blog posts seed completed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
