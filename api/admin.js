// api/admin.js
// ─────────────────────────────────────────────────────────────
// Self-protecting admin page. Password check is built into the handler,
// not delegated to middleware. This makes it work reliably regardless
// of Vercel's middleware detection.
//
// Auth: HTTP Basic Auth. Username is ignored; password must match
// the ARCH_PASSWORD env var (or "sortedAUD123" if unset as a fallback).
//
// Env vars:
//   DATABASE_URL   — auto-set by the Neon integration
//   ARCH_PASSWORD  — the password to enter (defaults to sortedAUD123)
// ─────────────────────────────────────────────────────────────

import { neon } from '@neondatabase/serverless';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day} · ${time}`;
}

// ─── Auth check ─────────────────────────────────────────────
// Returns true if the request has valid Basic Auth credentials.
function isAuthorised(req) {
  const expected = process.env.ARCH_PASSWORD || 'sortedAUD123';
  const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!auth || typeof auth !== 'string') return false;
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    const supplied = idx >= 0 ? decoded.slice(idx + 1) : decoded;
    return supplied === expected;
  } catch {
    return false;
  }
}

function send401(res) {
  res.status(401);
  res.setHeader('WWW-Authenticate', 'Basic realm="Sorted Internal", charset="UTF-8"');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-store');
  res.end('Authentication required');
}

function renderPage(claims, total, errorMsg) {
  const rows = claims
    .map((c) => {
      const handle = esc(c.handle);
      const email = esc(c.email);
      const source = esc(c.source || '—');
      const when = esc(fmtDate(c.created_at));
      const statusKey = esc((c.status || 'new').toLowerCase());
      const statusLabel = esc(c.status || 'new');
      return `<tr>
        <td class="adm__handle">@${handle}</td>
        <td class="adm__email"><a href="mailto:${email}">${email}</a></td>
        <td class="adm__src">${source}</td>
        <td class="adm__when">${when}</td>
        <td><span class="adm__status adm__status--${statusKey}">${statusLabel}</span></td>
      </tr>`;
    })
    .join('');

  const claimsForCsv = JSON.stringify(
    claims.map((c) => ({
      handle: c.handle,
      email: c.email,
      source: c.source || '',
      status: c.status || 'new',
      created_at: c.created_at,
    }))
  ).replace(/</g, '\\u003c');

  const errBlock = errorMsg
    ? `<div class="adm__error">
        <strong>Error:</strong> ${esc(errorMsg)}
        <p style="margin-top:8px;font-size:13px;color:var(--ink-soft);">
          If the table doesn't exist yet, visit
          <code>/api/claim?init=YOUR_INIT_SECRET</code> once to create it.
        </p>
      </div>`
    : '';

  const tableBlock = claims.length === 0 && !errorMsg
    ? `<div class="adm__empty">
        <h2>No signups yet.</h2>
        <p>When someone submits the &ldquo;Claim your handle&rdquo; modal, they'll show up here.</p>
      </div>`
    : claims.length > 0
    ? `<div class="adm__table-wrap"><table class="adm__table">
        <thead><tr><th>Handle</th><th>Email</th><th>Source</th><th>When</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Admin · Handle Claims · Sorted</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@10..48,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --paper:#F6F2E9; --paper-elevated:#FFFCF5; --paper-deep:#EFEADD;
  --ink:#0E0E18; --ink-soft:#2A2A38; --ink-muted:#6B6B7A; --ink-faint:#B8B5AC;
  --line:#E5E0D2; --lime:#C8F154; --lime-deep:#A8D426; --lime-soft:#ECF8C7;
  --coral:#FF5A4E; --sky:#5BB7FF; --butter:#FFD66B;
  --shadow-ink-sm: 2px 2px 0 0 var(--ink);
  --font-display:'Bricolage Grotesque',system-ui,sans-serif;
  --font-body:'Plus Jakarta Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono','SF Mono',Menlo,monospace;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); font-family: var(--font-body); color: var(--ink); font-size: 15px; line-height: 1.55; -webkit-font-smoothing: antialiased; }
::selection { background: var(--lime); color: var(--ink); }
.adm { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }
.adm__head { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid var(--ink); }
.adm__head-inner { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 24px; }
.adm__tag { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; background: var(--ink); color: var(--paper); padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 8px; }
.adm__title { font-family: var(--font-display); font-weight: 800; font-size: clamp(36px, 5vw, 56px); line-height: 1; letter-spacing: -0.04em; margin: 0; }
.adm__head-right { display: flex; align-items: center; gap: 20px; }
.adm__count { text-align: right; }
.adm__count-num { font-family: var(--font-display); font-weight: 800; font-size: 40px; line-height: 1; letter-spacing: -0.035em; }
.adm__count-label { font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); margin-top: 4px; }
.adm__btn { font-family: var(--font-display); font-weight: 700; font-size: 14px; background: var(--lime); color: var(--ink); border: 1.5px solid var(--ink); border-radius: 12px; padding: 12px 18px; box-shadow: var(--shadow-ink-sm); cursor: pointer; transition: transform 80ms ease, box-shadow 80ms ease; }
.adm__btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 0 var(--ink); }
.adm__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.adm__error { background: #FFE4E0; border: 1.5px solid var(--coral); border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; font-size: 14px; line-height: 1.5; }
.adm__error code { font-family: var(--font-mono); font-size: 12px; background: var(--paper-deep); padding: 2px 6px; border-radius: 4px; }
.adm__empty { text-align: center; padding: 80px 20px; background: var(--paper-elevated); border: 1.5px dashed var(--line); border-radius: 20px; }
.adm__empty h2 { font-family: var(--font-display); font-weight: 800; font-size: 28px; letter-spacing: -0.025em; margin: 0 0 8px; }
.adm__empty p { color: var(--ink-muted); margin: 0; }
.adm__table-wrap { border-radius: 16px; border: 1.5px solid var(--line); overflow: hidden; background: var(--paper-elevated); }
.adm__table { width: 100%; border-collapse: collapse; font-size: 14px; }
.adm__table thead { background: var(--ink); color: var(--paper); }
.adm__table th { text-align: left; padding: 12px 16px; font-family: var(--font-mono); font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; }
.adm__table td { padding: 14px 16px; border-bottom: 1px solid var(--line); vertical-align: middle; }
.adm__table tbody tr:nth-child(even) { background: var(--paper-deep); }
.adm__table tbody tr:last-child td { border-bottom: none; }
.adm__table tbody tr:hover { background: var(--lime-soft); }
.adm__handle { font-family: var(--font-display); font-weight: 700; font-size: 15px; }
.adm__email a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--ink-faint); text-underline-offset: 3px; }
.adm__email a:hover { text-decoration-color: var(--ink); }
.adm__src { font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted); }
.adm__when { font-family: var(--font-mono); font-size: 12px; color: var(--ink-soft); white-space: nowrap; }
.adm__status { display: inline-block; font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; background: var(--lime); color: var(--ink); border: 1px solid var(--ink); }
.adm__status--new { background: var(--lime); }
.adm__status--contacted { background: var(--sky); color: var(--ink); }
.adm__status--beta { background: var(--butter); color: var(--ink); }
.adm__status--live { background: var(--ink); color: var(--paper); }
.adm__foot { margin-top: 64px; padding-top: 24px; border-top: 1.5px solid var(--ink); text-align: center; font-family: var(--font-mono); font-size: 10.5px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); }
@media (max-width: 640px) {
  .adm__head-inner { flex-direction: column; align-items: flex-start; }
  .adm__head-right { width: 100%; justify-content: space-between; }
  .adm__table th:nth-child(3), .adm__table td:nth-child(3),
  .adm__table th:nth-child(4), .adm__table td:nth-child(4) { display: none; }
}
</style>
</head>
<body>
<div class="adm">
  <header class="adm__head">
    <div class="adm__head-inner">
      <div>
        <div class="adm__tag">Internal</div>
        <h1 class="adm__title">Handle Claims</h1>
      </div>
      <div class="adm__head-right">
        <div class="adm__count">
          <div class="adm__count-num">${total}</div>
          <div class="adm__count-label">Total signups</div>
        </div>
        <button id="adm-export" class="adm__btn" type="button"${claims.length === 0 ? ' disabled' : ''}>Export CSV</button>
      </div>
    </div>
  </header>
  <main>
    ${errBlock}
    ${tableBlock}
  </main>
  <footer class="adm__foot">Money, sorted.</footer>
</div>
<script>
(function(){
  var claims = ${claimsForCsv};
  var btn = document.getElementById('adm-export');
  if (!btn || !claims || claims.length === 0) return;
  btn.addEventListener('click', function() {
    var headers = ['handle','email','source','status','created_at'];
    var escapeCell = function(v) {
      var s = String(v == null ? '' : v);
      return /[",\\n\\r]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
    };
    var lines = [headers.join(',')];
    claims.forEach(function(c) {
      lines.push(headers.map(function(h){ return escapeCell(c[h]); }).join(','));
    });
    var blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sorted-handle-claims-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  // ─── AUTH GATE — checked first, before any DB work ────────────
  if (!isAuthorised(req)) {
    return send401(res);
  }

  let claims = [];
  let total = 0;
  let errorMsg = '';

  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      errorMsg = 'DATABASE_URL not set in Vercel env vars';
    } else {
      const sql = neon(url);
      const rows = await sql`
        SELECT id, handle, email, source, status, created_at
        FROM handle_claims
        ORDER BY created_at DESC
        LIMIT 500
      `;
      claims = rows;
      const countRows = await sql`SELECT count(*)::int AS n FROM handle_claims`;
      total = (countRows[0] && countRows[0].n) || rows.length;
    }
  } catch (err) {
    errorMsg = String(err && err.message ? err.message : err);
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(renderPage(claims, total, errorMsg));
}
