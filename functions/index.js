const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { google } = require('googleapis');

initializeApp();
const db = getFirestore();

function encodeMessage(message) {
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));
}

exports.contact = onRequest({
  region: 'europe-west1',
  secrets: [
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_REFRESH_TOKEN',
    'GMAIL_SENDER',
    'CONTACT_RECIPIENT',
  ],
}, async (req, res) => {
  const origin = req.get('origin');
  res.set('Access-Control-Allow-Origin', origin || '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Nome ed email validi sono obbligatori.' });
  }

  const request = {
    name,
    email,
    message,
    createdAt: FieldValue.serverTimestamp(),
    userAgent: req.get('user-agent') || '',
  };

  const savedRequest = await db.collection('contactRequests').add(request);

  try {
    const auth = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    );
    auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth });
    const sender = process.env.GMAIL_SENDER;
    const recipient = process.env.CONTACT_RECIPIENT;
    const subject = `Nuova richiesta dal sito - ${name}`;
    const body = [
      `Nome: ${name}`,
      `Email: ${email}`,
      '',
      message || '(nessun messaggio)',
      '',
      `ID richiesta: ${savedRequest.id}`,
    ].join('\n');
    const rawMessage = [
      `From: ${sender}`,
      `To: ${recipient}`,
      `Reply-To: ${email}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      body,
    ].join('\r\n');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodeMessage(rawMessage) },
    });
  } catch (error) {
    console.error('Email send failed', error);
    await savedRequest.update({ emailStatus: 'failed' });
    return res.status(202).json({ ok: true, warning: 'Richiesta salvata, ma email non inviata.' });
  }

  await savedRequest.update({ emailStatus: 'sent' });
  return res.status(201).json({ ok: true });
});
