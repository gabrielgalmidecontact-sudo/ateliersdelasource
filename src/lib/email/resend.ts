// src/lib/email/resend.ts
// Client Resend + templates d'emails
// Utiliser RESEND_API_KEY dans les variables d'environnement

import { Resend } from 'resend'

// Lazy initialization — évite l'erreur de build si la clé est manquante
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY manquante. Configurez la variable d\'environnement.')
    }
    _resend = new Resend(apiKey)
  }
  return _resend
}

// ─── Config ────────────────────────────────────────────────────
const FROM_EMAIL = process.env.EMAIL_FROM || 'Les Ateliers de la Source <noreply@ateliersdelasource.fr>'
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'gabrielgalmide.contact@gmail.com'
const SITE_NAME = 'Les Ateliers de la Source'

// ─── Template de base HTML ────────────────────────────────────
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6EF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6EF;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#5C3D2E;padding:28px 40px;border-radius:2px 2px 0 0;">
              <p style="margin:0;font-family:Georgia,serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#C8912A;">Les Ateliers</p>
              <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:20px;color:#F5EDD8;font-weight:600;">de la Source</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px;border:1px solid #D4C4A8;border-top:none;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F5EDD8;padding:20px 40px;border:1px solid #D4C4A8;border-top:none;border-radius:0 0 2px 2px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#7A6355;line-height:1.6;">
                © ${new Date().getFullYear()} ${SITE_NAME} · 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'}" style="color:#C8912A;text-decoration:none;">
                  Visiter le site
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// ─── Emails transactionnels ───────────────────────────────────

/**
 * Email de confirmation d'inscription (envoyé au nouveau membre)
 */
export async function sendWelcomeEmail(params: {
  to: string
  firstName: string
}) {
  const resend = getResend()
  const { to, firstName } = params

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#5C3D2E;margin:0 0 16px;">
      Bienvenue, ${firstName} 👋
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">
      Votre espace membre aux <strong>Ateliers de la Source</strong> vient d'être créé.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 24px;">
      Vous pouvez dès maintenant compléter votre profil, découvrir les prochains stages et suivre votre parcours personnel.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#5C3D2E;border-radius:2px;padding:14px 28px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'}/espace-membre" 
             style="font-family:Arial,sans-serif;font-size:14px;color:#F5EDD8;text-decoration:none;font-weight:600;letter-spacing:0.5px;">
            Accéder à mon espace →
          </a>
        </td>
      </tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#7A6355;line-height:1.6;margin:0;border-top:1px solid #D4C4A8;padding-top:16px;">
      Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.
    </p>
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Bienvenue aux Ateliers de la Source, ${firstName} !`,
    html: baseTemplate(content),
  })
}

/**
 * Email de notification de contact (envoyé à Gabriel)
 */
export async function sendContactNotification(params: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}) {
  const resend = getResend()
  const { name, email, phone, subject, message } = params

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#5C3D2E;margin:0 0 20px;">
      Nouveau message de contact
    </h1>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8D8;">
          <span style="font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;">Nom</span>
          <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;font-weight:600;">${name}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8D8;">
          <span style="font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;">Email</span>
          <p style="margin:4px 0 0;">
            <a href="mailto:${email}" style="font-family:Arial,sans-serif;font-size:15px;color:#C8912A;">${email}</a>
          </p>
        </td>
      </tr>
      ${phone ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8D8;">
          <span style="font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;">Téléphone</span>
          <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;">${phone}</p>
        </td>
      </tr>` : ''}
      ${subject ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0E8D8;">
          <span style="font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;">Sujet</span>
          <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;">${subject}</p>
        </td>
      </tr>` : ''}
    </table>
    <div style="background-color:#FAF6EF;border:1px solid #D4C4A8;border-radius:2px;padding:20px;margin-bottom:24px;">
      <span style="font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;display:block;margin-bottom:10px;">Message</span>
      <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
    </div>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color:#C8912A;border-radius:2px;padding:12px 24px;">
          <a href="mailto:${email}" 
             style="font-family:Arial,sans-serif;font-size:14px;color:#FFFFFF;text-decoration:none;font-weight:600;">
            Répondre à ${name} →
          </a>
        </td>
      </tr>
    </table>
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `[Contact] ${subject || 'Message de ' + name}`,
    html: baseTemplate(content),
  })
}

/**
 * Email de confirmation au visiteur qui a rempli le formulaire de contact
 */
export async function sendContactConfirmation(params: {
  to: string
  name: string
}) {
  const resend = getResend()
  const { to, name } = params

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#5C3D2E;margin:0 0 16px;">
      Votre message a bien été reçu
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">
      Bonjour ${name},
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">
      Merci pour votre message. Gabriel ou Amélie vous répondra dans les meilleurs délais, généralement sous 48 heures.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 24px;">
      En attendant, vous pouvez découvrir les prochains stages et activités sur notre site.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color:#5C3D2E;border-radius:2px;padding:14px 28px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'}/evenements" 
             style="font-family:Arial,sans-serif;font-size:14px;color:#F5EDD8;text-decoration:none;font-weight:600;">
            Voir les prochains stages →
          </a>
        </td>
      </tr>
    </table>
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Votre message a bien été reçu — Les Ateliers de la Source',
    html: baseTemplate(content),
  })
}

/**
 * Email générique — utilisé pour les webhooks Make/n8n
 */
export async function sendEmail(params: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  })
}



export async function sendReviewRequestEmail(params: {
  to: string
  firstName?: string | null
  eventTitle: string
  eventSlug: string
}) {
  const resend = getResend()
  const { to, firstName, eventTitle, eventSlug } = params

  const greeting = firstName?.trim() ? `Bonjour ${firstName},` : 'Bonjour,'
  const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'}/evenements/${eventSlug}`

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#5C3D2E;margin:0 0 16px;">
      Merci pour votre présence
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">${greeting}</p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">
      Merci d’avoir participé à <strong>${eventTitle}</strong>.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 24px;">
      Si vous le souhaitez, vous pouvez partager votre ressenti en laissant un avis. Cela aide d’autres personnes à découvrir le travail proposé aux Ateliers de la Source.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#C8912A;border-radius:2px;padding:14px 28px;">
          <a href="${reviewUrl}" 
             style="font-family:Arial,sans-serif;font-size:14px;color:#FFFFFF;text-decoration:none;font-weight:600;letter-spacing:0.5px;">
            Laisser un avis →
          </a>
        </td>
      </tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#7A6355;line-height:1.6;margin:0;border-top:1px solid #D4C4A8;padding-top:16px;">
      Votre avis sera relu avant publication sur le site.
    </p>
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Merci pour votre présence — ${eventTitle}`,
    html: baseTemplate(content),
  })
}

export async function sendReservationPracticalEmail(params: {
  to: string
  firstName?: string | null
  eventTitle: string
  eventDate: string
}) {
  const resend = getResend()
  const { to, firstName, eventTitle, eventDate } = params

  const greeting = firstName?.trim() ? `Bonjour ${firstName},` : 'Bonjour,'

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#5C3D2E;margin:0 0 16px;">
      Votre demande de réservation a bien été enregistrée
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">${greeting}</p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 16px;">
      Nous avons bien reçu votre demande pour <strong>${eventTitle}</strong> prévu le <strong>${eventDate}</strong>.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 24px;">
      Pour vous aider à préparer votre venue, voici les informations utiles concernant l’accès aux Ateliers de la Source.
    </p>

    <div style="background-color:#FAF6EF;border:1px solid #D4C4A8;border-radius:2px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;">Infos pratiques</p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>Adresse :</strong> 977 chemin de Betbèze, 65230 Thermes-Magnoac, France
      </p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>En voiture :</strong> vous pouvez entrer directement cette adresse dans votre GPS.<br />
        <a href="https://maps.google.com/?q=977+chemin+de+Betbeze+65230+Thermes-Magnoac" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Ouvrir dans Google Maps →</a>
      </p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>En train :</strong> prendre un billet jusqu’à <strong>Toulouse Matabiau</strong>, puis le bus jusqu’à <strong>Boulogne-sur-Gesse</strong> (terminus). Le trajet en bus dure environ <strong>2h15</strong>.<br />
        <a href="https://www.sncf-connect.com/" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Réserver un train →</a><br />
        <a href="https://plan.lio-occitanie.fr/" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Lien liO bus →</a><br />
        <span style="color:#7A6355;">Important : vérifiez les horaires auprès de la gare routière Pierre Sémard, adjacente à la gare Toulouse Matabiau, en appelant le <strong>3634</strong>. Les horaires peuvent être compliqués à décrypter.</span>
      </p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>En avion :</strong> arrivée à <strong>Toulouse Blagnac</strong>, puis rejoindre <strong>Toulouse Matabiau</strong> <strong>en navette</strong> avant de prendre le bus jusqu’à <strong>Boulogne-sur-Gesse</strong>.<br />
        <a href="https://www.toulouse.aeroport.fr/transports-et-acces/transports-en-commun" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Accès depuis l’aéroport de Toulouse Blagnac →</a><br />
        <a href="https://plan.lio-occitanie.fr/" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Lien liO bus →</a><br />
        <span style="color:#7A6355;">Important : vérifiez les horaires auprès de la gare routière Pierre Sémard, adjacente à la gare Toulouse Matabiau, en appelant le <strong>3634</strong>. Les horaires peuvent être compliqués à décrypter.</span>
      </p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>Transport local :</strong> réseau Tisséo, liO ligne 365, taxi ou VTC selon votre organisation.<br />
        <a href="https://plan.lio-occitanie.fr/" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Voir les horaires liO →</a><br />
        <a href="https://www.nav-eco.fr/reserver-un-chauffeur?keyword=taxi%20aeroport%20toulouse" target="_blank" rel="noopener noreferrer" style="color:#C8912A;text-decoration:none;">Réserver un chauffeur / VTC →</a>
      </p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>Navette / accueil :</strong> merci de nous communiquer votre heure d’arrivée à Boulogne-sur-Gesse si vous arrivez en transport collectif. Nous pourrons venir vous chercher, les Ateliers étant à environ 5 minutes.
      </p>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>Option confort :</strong> taxi Toulouse → Thermes-Magnoac (environ 140 à 200€), ou possibilité que nous venions vous chercher à Toulouse selon disponibilité et défraiement à convenir.
      </p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        <strong>Téléphone gare routière Pierre Sémard :</strong> 36 35
      </p>
    </div>

    <div style="background-color:#FFF8E8;border:1px solid #E8D8B8;border-radius:2px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7A6355;">Contact coordination</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2D1F14;line-height:1.8;">
        Café culturel "La Source"<br />
        Mr Gabriel Boé<br />
        Tél. : 0033 (0)7 68 97 25 03<br />
        Mail : gabrielboe.lasource@gmail.com
      </p>
    </div>

    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2D1F14;line-height:1.7;margin:0 0 6px;">
      Au plaisir de vous accueillir,
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#5C3D2E;line-height:1.7;margin:0;font-weight:600;">
      Gabriel & Amélie
    </p>
  `

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Infos pratiques — ${eventTitle}`,
    html: baseTemplate(content),
  })
}
