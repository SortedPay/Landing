// POST /api/claim
//   { check: "handle" }            -> { ok, taken }
//   { handle, email, source? }     -> { ok } | { ok:false, taken:true } | { ok:false, error }
// GET  /api/claim?init=<INIT_SECRET> -> one-time schema setup (idempotent)
//
// Env: DATABASE_URL (Neon), INIT_SECRET.

import { getSql, send, parseBody, clientMeta, EMAIL_RE, HANDLE_RE, RESERVED_HANDLES } from './_db.js';

async function initSchema(sql) {
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
  await sql`CREATE INDEX IF NOT EXISTS idx_handle_claims_created ON handle_claims (created_at DESC)`;
  // Earlier rows never enforced uniqueness. Keep the first claim of each
  // handle live, mark the rest as duplicates, then enforce going forward.
  await sql`
    UPDATE handle_claims SET status = 'duplicate'
    WHERE status <> 'duplicate' AND id NOT IN (
      SELECT DISTINCT ON (lower(handle)) id FROM handle_claims
      WHERE status <> 'duplicate'
      ORDER BY lower(handle), created_at ASC, id ASC
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_handle_claims_handle
    ON handle_claims (lower(handle)) WHERE status <> 'duplicate'
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id           bigserial PRIMARY KEY,
      name         text NOT NULL,
      email        text NOT NULL,
      message      text NOT NULL,
      status       text DEFAULT 'new',
      ip           text,
      user_agent   text,
      created_at   timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at DESC)`;
}

function normaliseHandle(raw) {
  return String(raw || '').trim().toLowerCase().replace(/^@/, '');
}

async function isTaken(sql, handle) {
  if (RESERVED_HANDLES.has(handle)) return true;
  const rows = await sql`
    SELECT 1 FROM handle_claims
    WHERE lower(handle) = ${handle} AND status <> 'duplicate'
    LIMIT 1
  `;
  return rows.length > 0;
}

export default async function handler(req, res) {
  const sql = getSql();
  if (!sql) return send(res, 500, { ok: false, error: 'DATABASE_URL not configured' });

  if (req.method === 'GET') {
    const init = (req.query && req.query.init) || '';
    const secret = process.env.INIT_SECRET;
    if (!secret || init !== secret) return send(res, 404, { ok: false, error: 'Not found' });
    try {
      await initSchema(sql);
      return send(res, 200, { ok: true, message: 'Schema ready.' });
    } catch (err) {
      console.error('Init failed', err);
      return send(res, 500, { ok: false, error: String(err && err.message ? err.message : err) });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const body = parseBody(req);
  if (!body) return send(res, 400, { ok: false, error: 'Invalid JSON body' });

  if (typeof body.check === 'string') {
    const handle = normaliseHandle(body.check);
    if (!HANDLE_RE.test(handle)) return send(res, 200, { ok: true, taken: true, reason: 'invalid' });
    try {
      return send(res, 200, { ok: true, taken: await isTaken(sql, handle) });
    } catch (err) {
      console.error('Check failed', err);
      return send(res, 500, { ok: false, error: 'Could not check that handle' });
    }
  }

  const handle = normaliseHandle(body.handle);
  const email = String(body.email || '').trim().toLowerCase();
  const source = String(body.source || 'sorted-landing').trim().slice(0, 100);

  if (!HANDLE_RE.test(handle)) return send(res, 400, { ok: false, error: 'Invalid handle' });
  if (!EMAIL_RE.test(email) || email.length > 254) return send(res, 400, { ok: false, error: 'Invalid email' });
  if (RESERVED_HANDLES.has(handle)) return send(res, 409, { ok: false, taken: true });

  const { ip, userAgent } = clientMeta(req);
  try {
    await sql`
      INSERT INTO handle_claims (handle, email, source, ip, user_agent)
      VALUES (${handle}, ${email}, ${source}, ${ip}, ${userAgent})
    `;
    return send(res, 200, { ok: true });
  } catch (err) {
    if (err && (err.code === '23505' || /duplicate key/i.test(String(err.message)))) {
      return send(res, 409, { ok: false, taken: true });
    }
    console.error('Insert failed', err);
    const msg = String(err && err.message ? err.message : err);
    if (msg.includes('does not exist')) {
      return send(res, 500, { ok: false, error: 'Database not initialised. Visit /api/claim?init=<INIT_SECRET> once.' });
    }
    return send(res, 500, { ok: false, error: 'Could not save submission' });
  }
}
