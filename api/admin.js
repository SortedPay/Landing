// GET /api/admin (rewritten from /admin) — internal list of handle claims and
// contact messages. HTTP Basic Auth against ADMIN_PASSWORD; closed when unset.

import { getSql, isAuthorised, send401 } from './_db.js';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Brisbane' });
  const time = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Australia/Brisbane' });
  return `${day} · ${time}`;
}

function claimRows(claims) {
  return claims.map((c) => `<tr>
    <td class="adm__handle">@${esc(c.handle)}</td>
    <td class="adm__email"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></td>
    <td class="adm__src">${esc(c.source || '—')}</td>
    <td class="adm__when">${esc(fmtDate(c.created_at))}</td>
    <td><span class="adm__status adm__status--${esc((c.status || 'new').toLowerCase())}">${esc(c.status || 'new')}</span></td>
  </tr>`).join('');
}

function messageRows(messages) {
  return messages.map((m) => `<tr>
    <td class="adm__handle">${esc(m.name)}</td>
    <td class="adm__email"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></td>
    <td class="adm__msg">${esc(m.message)}</td>
    <td class="adm__when">${esc(fmtDate(m.created_at))}</td>
  </tr>`).join('');
}

function renderPage({ claims, total, messages, errorMsg }) {
  const claimsForCsv = JSON.stringify(
    claims.map((c) => ({ handle: c.handle, email: c.email, source: c.source || '', status: c.status || 'new', created_at: c.created_at }))
  ).replace(/</g, '\\u003c');

  const errBlock = errorMsg
    ? `<div class="adm__error"><strong>Error:</strong> ${esc(errorMsg)}<p>If the tables don't exist yet, visit <code>/api/claim?init=YOUR_INIT_SECRET</code> once.</p></div>`
    : '';

  const claimsBlock = claims.length === 0
    ? `<div class="adm__empty"><h2>No signups yet.</h2><p>Handle claims from the site land here.</p></div>`
    : `<div class="adm__table-wrap"><table class="adm__table">
        <thead><tr><th>Handle</th><th>Email</th><th>Source</th><th>When</th><th>Status</th></tr></thead>
        <tbody>${claimRows(claims)}</tbody></table></div>`;

  const messagesBlock = messages.length === 0
    ? `<div class="adm__empty"><h2>No messages yet.</h2><p>Contact-form submissions land here.</p></div>`
    : `<div class="adm__table-wrap"><table class="adm__table">
        <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>When</th></tr></thead>
        <tbody>${messageRows(messages)}</tbody></table></div>`;

  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Admin · Sorted</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
:root{--paper:#F6F2E9;--paper-elevated:#FFFCF5;--paper-deep:#EFEADD;--ink:#0E0E18;--ink-soft:#2A2A38;--ink-muted:#6B6B7A;--line:#E5E0D2;--lime:#C8F154;--lime-soft:#ECF8C7;--coral:#FF5A4E;--sky:#5BB7FF;--butter:#FFD66B;--font-display:'Bricolage Grotesque',system-ui,sans-serif;--font-body:'Plus Jakarta Sans',system-ui,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);font-family:var(--font-body);color:var(--ink);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
.adm{max-width:1200px;margin:0 auto;padding:32px 24px 80px}
.adm__head{margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid var(--ink);display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px}
.adm__tag{font-family:var(--font-mono);font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;background:var(--ink);color:var(--paper);padding:3px 10px;border-radius:999px;display:inline-block;margin-bottom:8px}
.adm__title{font-family:var(--font-display);font-weight:700;font-size:clamp(36px,5vw,56px);line-height:1;letter-spacing:-.04em;margin:0}
h2.adm__section{font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.025em;margin:48px 0 16px;display:flex;align-items:baseline;gap:12px}
h2.adm__section small{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-muted)}
.adm__head-right{display:flex;align-items:center;gap:20px}
.adm__count{text-align:right}
.adm__count-num{font-family:var(--font-display);font-weight:700;font-size:40px;line-height:1;letter-spacing:-.035em}
.adm__count-label{font-family:var(--font-mono);font-size:9px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-muted);margin-top:4px}
.adm__btn{font-family:var(--font-display);font-weight:700;font-size:14px;background:var(--lime);color:var(--ink);border:1.5px solid var(--ink);border-radius:12px;padding:12px 18px;box-shadow:2px 2px 0 0 var(--ink);cursor:pointer}
.adm__btn:active{transform:translate(2px,2px);box-shadow:none}
.adm__btn:disabled{opacity:.4;cursor:not-allowed}
.adm__error{background:#FFE4E0;border:1.5px solid var(--coral);border-radius:14px;padding:16px 20px;margin-bottom:24px;font-size:14px}
.adm__error code{font-family:var(--font-mono);font-size:12px;background:var(--paper-deep);padding:2px 6px;border-radius:4px}
.adm__empty{text-align:center;padding:48px 20px;background:var(--paper-elevated);border:1.5px dashed var(--line);border-radius:20px}
.adm__empty h2{font-family:var(--font-display);font-weight:700;font-size:22px;letter-spacing:-.025em;margin:0 0 6px}
.adm__empty p{color:var(--ink-muted);margin:0}
.adm__table-wrap{border-radius:16px;border:1.5px solid var(--line);overflow:auto;background:var(--paper-elevated)}
.adm__table{width:100%;border-collapse:collapse;font-size:14px}
.adm__table thead{background:var(--ink);color:var(--paper)}
.adm__table th{text-align:left;padding:12px 16px;font-family:var(--font-mono);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.16em}
.adm__table td{padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:top}
.adm__table tbody tr:nth-child(even){background:var(--paper-deep)}
.adm__table tbody tr:hover{background:var(--lime-soft)}
.adm__handle{font-family:var(--font-display);font-weight:700;font-size:15px;white-space:nowrap}
.adm__email a{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
.adm__src{font-family:var(--font-mono);font-size:12px;color:var(--ink-muted)}
.adm__msg{white-space:pre-wrap;max-width:520px}
.adm__when{font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);white-space:nowrap}
.adm__status{display:inline-block;font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:var(--lime);color:var(--ink);border:1px solid var(--ink)}
.adm__status--contacted{background:var(--sky)}
.adm__status--beta{background:var(--butter)}
.adm__status--live{background:var(--ink);color:var(--paper)}
.adm__status--duplicate{background:var(--paper-deep);color:var(--ink-muted)}
.adm__foot{margin-top:64px;padding-top:24px;border-top:1.5px solid var(--ink);text-align:center;font-family:var(--font-mono);font-size:10.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-muted)}
@media (max-width:640px){.adm__head{flex-direction:column;align-items:flex-start}.adm__head-right{width:100%;justify-content:space-between}}
</style>
</head>
<body>
<div class="adm">
  <header class="adm__head">
    <div><div class="adm__tag">Internal</div><h1 class="adm__title">Sorted admin</h1></div>
    <div class="adm__head-right">
      <div class="adm__count"><div class="adm__count-num">${total}</div><div class="adm__count-label">Handle claims</div></div>
      <button id="adm-export" class="adm__btn" type="button"${claims.length === 0 ? ' disabled' : ''}>Export CSV</button>
    </div>
  </header>
  <main>
    ${errBlock}
    <h2 class="adm__section">Handle claims <small>latest 500</small></h2>
    ${claimsBlock}
    <h2 class="adm__section">Contact messages <small>latest 200</small></h2>
    ${messagesBlock}
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
    var cell = function(v){ var s = String(v == null ? '' : v); return /[",\\n\\r]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; };
    var lines = [headers.join(',')];
    claims.forEach(function(c){ lines.push(headers.map(function(h){ return cell(c[h]); }).join(',')); });
    var blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'sorted-handle-claims-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  });
})();
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (!isAuthorised(req)) return send401(res);

  let claims = [];
  let messages = [];
  let total = 0;
  let errorMsg = '';
  try {
    const sql = getSql();
    if (!sql) {
      errorMsg = 'DATABASE_URL not set in Vercel env vars';
    } else {
      claims = await sql`
        SELECT id, handle, email, source, status, created_at
        FROM handle_claims ORDER BY created_at DESC LIMIT 500
      `;
      const countRows = await sql`SELECT count(*)::int AS n FROM handle_claims WHERE status <> 'duplicate'`;
      total = (countRows[0] && countRows[0].n) || claims.length;
      try {
        messages = await sql`
          SELECT id, name, email, message, status, created_at
          FROM contact_messages ORDER BY created_at DESC LIMIT 200
        `;
      } catch (err) {
        if (!/does not exist/.test(String(err && err.message))) throw err;
      }
    }
  } catch (err) {
    errorMsg = String(err && err.message ? err.message : err);
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(renderPage({ claims, total, messages, errorMsg }));
}
