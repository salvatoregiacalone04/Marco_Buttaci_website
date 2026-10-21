import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const updateFlag = async (id, field) => {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/richieste?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ [field]: true }),
    },
  );

  if (!response.ok) {
    throw new Error(`Errore aggiornamento Supabase: ${response.status}`);
  }
};

const sendEmail = async (options) => {
  const { error } = await resend.emails.send(options);
  if (error) throw new Error(`Errore Resend: ${JSON.stringify(error)}`);
};

export default async function handler(req, res) {
  // Gestisci solo le richieste POST inviate dal form.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};

  // Honeypot: rispondi senza rivelare il filtro e senza usare servizi esterni.
  if (String(body.sito || '').trim()) {
    return res.status(200).json({ ok: true });
  }

  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const messaggio = typeof body.messaggio === 'string' ? body.messaggio.trim() : '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?[0-9][0-9\s().-]{6,24}$/;
  const isEmail = emailPattern.test(email);
  const isPhone = phonePattern.test(email);

  if (nome.length < 1 || nome.length > 100) {
    return res.status(400).json({ error: 'Inserisci un nome valido' });
  }
  if (email.length < 3 || email.length > 200 || (!isEmail && !isPhone)) {
    return res.status(400).json({ error: 'Inserisci un’email o un numero di telefono valido' });
  }
  if (messaggio.length < 1 || messaggio.length > 2000) {
    return res.status(400).json({ error: 'Inserisci un messaggio valido' });
  }

  let richiesta;
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/richieste`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ nome, email, messaggio }),
    });

    const details = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Errore salvataggio Supabase: ${response.status} ${JSON.stringify(details)}`);
    }

    richiesta = Array.isArray(details) ? details[0] : details;
    if (!richiesta?.id) throw new Error('Supabase non ha restituito l’id della richiesta');
  } catch (error) {
    console.error('Errore salvataggio richiesta:', error);
    return res.status(500).json({ error: 'Impossibile salvare la richiesta' });
  }

  const safeNome = escapeHtml(nome);
  const safeEmail = escapeHtml(email);
  const safeMessaggio = escapeHtml(messaggio).replace(/\r?\n/g, '<br>');

  // La riga è già salvata: gli errori email vengono loggati senza fallire la richiesta.
  try {
    await sendEmail({
      from: process.env.MAIL_FROM,
      to: process.env.OWNER_EMAIL,
      replyTo: isEmail ? email : undefined,
      subject: `Nuovo messaggio da ${nome}`,
      html: `
        <h3>Hai ricevuto una nuova richiesta dal sito:</h3>
        <p><strong>Nome:</strong> ${safeNome}</p>
        <p><strong>Contatto:</strong> ${safeEmail}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${safeMessaggio}</p>
      `,
    });
    await updateFlag(richiesta.id, 'notifica_inviata');
  } catch (error) {
    console.error('Errore invio notifica email:', error);
  }

  if (isEmail && String(process.env.SEND_CONFIRMATION).toLowerCase() === 'true') {
    try {
      await sendEmail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Ho ricevuto la tua richiesta',
        html: `<p>Ciao ${safeNome},</p><p>Ho ricevuto la tua richiesta, ti risponderò presto.</p>`,
      });
      await updateFlag(richiesta.id, 'conferma_inviata');
    } catch (error) {
      console.error('Errore invio conferma email:', error);
    }
  }

  return res.status(200).json({ ok: true });
}
