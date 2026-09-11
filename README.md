# Sorted — marketing site

Astro 6 static site for [paymentsorted.com](https://www.paymentsorted.com), plus three Vercel serverless functions that back the handle-claim waitlist, the contact form and a small admin page.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check (types + a11y hints)
npm run build    # static output in dist/
```

## Layout

- `src/pages/*.astro` — one file per route. Redirect stubs: `/earn` → `/card`, `/blog` → `/why-sorted`, `/demo` → app.
- `src/layouts/Base.astro` — head, nav, footer, claim modal, shared client scripts.
- `src/components/` — nav, footer, icon sprite, wavy ribbons, claim modal, P2P animation.
- `src/styles/global.css` — design tokens + site-wide primitives. `page.css` — inner-page layout (subhero, prose, cards, forms, FAQ).
- `api/` — Vercel Node functions: `claim.js` (waitlist + availability check + one-time schema init), `contact.js`, `admin.js` (`/admin`). Shared helpers in `_db.js`.
- `public/` — favicons, OG image, brand marks, `robots.txt`, web manifest.

## Environment

Copy `.env.example`. `DATABASE_URL` comes from the Neon integration on Vercel; set `INIT_SECRET` and `ADMIN_PASSWORD` in the Vercel project (Production + Preview). After the first deploy, open `/api/claim?init=<INIT_SECRET>` once to create the tables. Admin is closed until `ADMIN_PASSWORD` is set.

## Brand

Paper `#F6F2E9`, ink `#0E0E18`, lime `#C8F154`, coral, sky, butter. Bricolage Grotesque (display), Plus Jakarta Sans (body), JetBrains Mono (labels). Wordmark is lowercase `sorted.` with the full stop.

## Copy rules

No yield or interest claims. Sorted Points are earned from actions only. AUDD is issued by AUDC Pty Ltd; Sorted is an authorised representative, not an AFSL holder, not an ADI, not a custodian. All contact addresses are `@paymentsorted.com`.
