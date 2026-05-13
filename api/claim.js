// api/claim.js
// ─────────────────────────────────────────────────────────────
// Vercel Serverless Function (Node runtime). Lives at repo root in /api/.
// Receives handle-claim submissions from the marketing modal,
// stores them in Neon Postgres.
//
// Env vars required (set in Vercel dashboard):
//   DATABASE_URL    — auto-set by the Neon integration
//   INIT_SECRET     — any random string, used once to create the table
//
// One-time setup: visit /api/claim?init=<INIT_SECRET> once to create the
// table. After that, the POST endpoint is live.
// ─────────────────────────────────────────────────────────────

import { neon } from '@neondatabase/serverless';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_RE = /^[a-zA-Z0-9_.]{3,20}$/;

function send(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return send(res, 500, { ok: false, error: 'DATABASE_URL not configured' });
  }
  const sql = neon(url);

  // ─── One-time table init via GET /api/claim?init=<secret> ──────
  if (req.method === 'GET') {
    const init = (req.query && req.query.init) || '';
    const secret = process.env.INIT_SECRET;
    if (!secret || init !== secret) {
      return send(res, 404, { ok: false, error: 'Not found' });
    }
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS handle_claims (
          id           bigserial PRIMARY KEY,
          handle       text NOT NULL,
          email        text NOT NULL,
          source       text DEFAULT 'sorted-landing',
          status       text DEFAULT 'new',
          notes        text,
          ip           text,
          user_agent   text,
          created_at   timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_handle_claims_email ON handle_claims (lower(email))`;
      await sql`CREATE INDEX IF NOT EXISTS idx_handle_claims_handle ON handle_claims (lower(handle))`;
      await sql`CREATE INDEX IF NOT EXISTS idx_handle_claims_created ON handle_claims (created_at DESC)`;
      return send(res, 200, { ok: true, message: 'Table created. Setup complete.' });
    } catch (err) {
      console.error('Init failed', err);
      return send(res, 500, { ok: false, error: String(err && err.message ? err.message : err) });
    }
  }

  // ─── POST: receive a claim ─────────────────────────────────────
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }

  // Parse JSON body — Vercel parses it for us if Content-Type is JSON,
  // but we handle the string case defensively.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return send(res, 400, { ok: false, error: 'Invalid JSON body' });
  }

  const handle = String(body.handle || '').trim().replace(/^@/, '');
  const email = String(body.email || '').trim().toLowerCase();
  const source = String(body.source || 'sorted-landing').trim().slice(0, 100);

  if (!handle || !HANDLE_RE.test(handle)) {
    return send(res, 400, { ok: false, error: 'Invalid handle' });
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return send(res, 400, { ok: false, error: 'Invalid email' });
  }

  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);
  const ip = (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    ''
  ).toString().split(',')[0].trim().slice(0, 100);

  try {
    await sql`
      INSERT INTO handle_claims (handle, email, source, ip, user_agent)
      VALUES (${handle}, ${email}, ${source}, ${ip}, ${userAgent})
    `;
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('Insert failed', err);
    const msg = String(err && err.message ? err.message : err);
    if (msg.includes('does not exist')) {
      return send(res, 500, {
        ok: false,
        error: 'Database not initialised. Visit /api/claim?init=<INIT_SECRET> once.',
      });
    }
    return send(res, 500, { ok: false, error: 'Could not save submission' });
  }
}
