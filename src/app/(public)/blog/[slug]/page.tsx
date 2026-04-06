// src/app/(public)/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetailPage } from '@/features/blog/BlogDetailPage'

const posts = [
  {
    title: 'Le Double : cette ombre qui nous suit',
    slug: 'le-double-cette-ombre-qui-nous-suit',
    excerpt: 'Qu\'est-ce que le Double Karmique ? Pourquoi certaines situations se répètent-elles dans notre vie ? Une introduction au travail que nous proposons lors de nos stages.',
    publishedAt: '2025-03-15',
    author: 'Gabriel',
    imageUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1400&q=80',
    content: `Dans chaque vie, il existe des situations qui se répètent. Des comportements que l'on reconnaît, que l'on regrette parfois, mais qu'on semble incapable de changer durablement.

« Je suis toujours en retard quand c'est important. »
« Je me retrouve toujours dans des relations qui ne fonctionnent pas. »
« On me reproche toujours la même chose. »

Ces patterns, nous les appelons le Double. Non pas dans un sens pathologique ou négatif — mais comme une structure de comportement, une habitude profonde, une empreinte invisible qui traverse nos actions.

Le théâtre, étonnamment, est l'un des espaces les plus puissants pour observer ces mécanismes. Parce que le jeu collectif reflète ce que nous portons. Parce que le groupe devient miroir. Parce que l'image est plus directe que les mots.

C'est le cœur du travail que nous proposons dans le stage Théâtre des Doubles Karmiques : identifier, comprendre, puis désamorcer ces mécanismes répétitifs — avec douceur, créativité et profondeur.`,
  },
  {
    title: 'Et si votre vie n\'était pas un hasard ?',
    slug: 'et-si-votre-vie-n-etait-pas-un-hasard',
    excerpt: 'L\'accompagnement biographique explore les rythmes invisibles qui traversent nos vies. Une approche profonde et douce pour comprendre son chemin.',
    publishedAt: '2025-02-20',
    author: 'Gabriel',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
    content: `Lorsqu'on observe une vie avec suffisamment de recul, on commence à distinguer des patterns, des rythmes, des correspondances troublantes entre des événements séparés par des années.

Cyr Boé, auprès de qui je me suis formé pendant trois ans, parle de « lois biographiques » — des structures rhythmiques qui traversent nos vies et semblent lui donner un sens.

L'accompagnement biographique ne cherche pas à interpréter votre vie de l'extérieur. Il vous invite à l'observer, avec recul et curiosité, comme on observe un texte qu'on commence seulement à comprendre.

Et si votre vie n'était pas une succession de hasards ? Et si chaque tournant, chaque rencontre, chaque épreuve participait d'une intelligence plus vaste ?

Ce sont ces questions — simples et profondes — que nous explorons ensemble lors d'un entretien biographique.`,
  },
  {
    title: 'Le corps parle avant les mots',
    slug: 'le-corps-parle-avant-les-mots',
    excerpt: 'Découvrez comment la posture, le souffle et le geste peuvent transformer notre façon de communiquer. Les secrets d\'une expression juste et incarnée.',
    publishedAt: '2025-01-10',
    author: 'Gabriel',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1400&q=80',
    content: `Quand j'étais jeune, je ne pouvais pas soutenir le regard des autres. Parler en public me semblait au-dessus de mes forces. Rire librement — impossible.

C'est par le théâtre, la danse, et de nombreux stages que j'ai découvert quelque chose d'essentiel : le corps est le premier espace de la parole.

Avant que les mots sortent, le corps a déjà parlé. La posture, le regard, la façon d'occuper l'espace, le rythme du souffle — tout cela précède et conditionne le message.

C'est pour ça que les ateliers d'expression que je propose passent autant par le corps que par la voix. On ne travaille pas « à parler mieux » en mode technique. On explore ce qui se passe dans le corps quand on souhaite s'exprimer — et on apprend à lui faire confiance.

Car lorsque le corps s'ouvre, le verbe s'ajuste. Et quand le verbe s'ajuste, quelque chose se libère.`,
  },
]

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) return { title: 'Article introuvable' }
  return { title: post.title, description: post.excerpt }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) notFound()
  return <BlogDetailPage post={post} />
}
