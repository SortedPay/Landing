// POST /api/contact  { name, email, message } -> { ok }
// Stored in contact_messages (created by /api/claim?init=...). Env: DATABASE_URL.

import { getSql, send, parseBody, clientMeta, EMAIL_RE } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }
  const sql = getSql();
  if (!sql) return send(res, 500, { ok: false, error: 'DATABASE_URL not configured' });

  const body = parseBody(req);
  if (!body) return send(res, 400, { ok: false, error: 'Invalid JSON body' });

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().toLowerCase();
  const message = String(body.message || '').trim().slice(0, 5000);

  if (name.length < 1) return send(res, 400, { ok: false, error: 'Tell us your name' });
  if (!EMAIL_RE.test(email) || email.length > 254) return send(res, 400, { ok: false, error: 'That email looks off' });
  if (message.length < 5) return send(res, 400, { ok: false, error: 'Write us a little more than that' });

  const { ip, userAgent } = clientMeta(req);
  try {
    await sql`
      INSERT INTO contact_messages (name, email, message, ip, user_agent)
      VALUES (${name}, ${email}, ${message}, ${ip}, ${userAgent})
    `;
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('Contact insert failed', err);
    return send(res, 500, { ok: false, error: 'Could not send that. Email hello@paymentsorted.com instead.' });
  }
}
