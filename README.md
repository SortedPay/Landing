# Sorted — Marketing Site

The marketing site for [Sorted](https://sortedaud.app), Australia's P2P payments app.

Built with [Astro](https://astro.build). Deploys statically to Vercel.

## Quick deploy

```bash
# 1. Clone and install
git clone <your-repo-url>
cd sorted-astro
npm install

# 2. Develop locally
npm run dev      # http://localhost:4321

# 3. Build for production
npm run build    # outputs to dist/

# 4. Deploy to Vercel
#    Push to GitHub, import the repo in Vercel — auto-detects Astro and just works.
```

The `vercel.json` is already configured. No further setup needed.

## Stack

- **Framework**: Astro 6.2
- **Language**: TypeScript (strict)
- **Styling**: Vanilla CSS with design tokens (no preprocessor)
- **Fonts**: Bricolage Grotesque (display), Plus Jakarta Sans (body), JetBrains Mono (mono) — loaded from Google Fonts
- **Output**: Static HTML, deployed to Vercel

## Project structure

```
sorted-astro/
├── public/                  # Static assets served as-is
│   ├── sorted-mark.svg      # Brand mark
│   ├── solana-logo.svg      # Official Solana wordmark
│   ├── favicon.svg          # Favicon source
│   ├── favicon-*.png        # Generated raster favicons
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── Header.astro     # Top nav (with active-state prop)
│   │   ├── Footer.astro     # Footer (incl. Solana badge + watermark)
│   │   ├── IconSprite.astro # All UI icons + Sorted mark sprite
│   │   ├── Marquee.astro    # Scrolling brand strip
│   │   └── PageCTA.astro    # Reusable bottom-of-page CTA card
│   ├── layouts/
│   │   └── Base.astro       # Top-level layout (head, fonts, scripts)
│   ├── pages/               # One file per route
│   │   ├── index.astro      # Landing page
│   │   ├── send.astro       # /send
│   │   ├── receive.astro    # /receive
│   │   ├── topup.astro      # /topup
│   │   ├── earn.astro       # /earn
│   │   ├── how-it-works.astro
│   │   ├── why-sorted.astro
│   │   ├── faq.astro
│   │   ├── blog.astro
│   │   ├── careers.astro
│   │   ├── press.astro
│   │   ├── contact.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── compliance.astro
│   │   └── security.astro
│   └── styles/
│       ├── global.css       # Design tokens + global elements
│       └── page.css         # Inner page styles (subhero, prose, callouts)
├── astro.config.mjs
├── tsconfig.json
├── vercel.json              # Deploy config (clean URLs)
└── package.json
```

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the built output locally
```

## Deploy

This repo is set up for automatic Vercel deployment. The `vercel.json` config:

- Detects Astro framework
- Runs `npm run build`
- Serves `dist/`
- Uses clean URLs (`/send` not `/send.html`)

To deploy:

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Vercel auto-detects everything — no further config needed

## Brand system

See `src/styles/global.css` for the full design tokens. Key colours:

- **Paper** (`#F6F2E9`) — warm cream background
- **Ink** (`#0E0E18`) — primary text and borders
- **Lime** (`#C8F154`) — primary brand colour, ALWAYS with ink-coloured text on top
- **Coral** (`#FF5A4E`) — accent (with paper-coloured text on top)
- **Sky** (`#5BB7FF`) — secondary accent
- **Butter** (`#FFD66B`) — tertiary accent

Core principles:

- Flat sticker fills, never gradients in UI surfaces
- Hard ink shadows (`0 3px 0 var(--ink)`)
- Bricolage Grotesque for display, ~700 weight, tight tracking (`-0.04em`)
- Lucide-style 1.8px stroke icons
- Dot-grid backgrounds (radial-gradient ink dots, fades at edges)

## Email capture / "Claim your handle" modal

Every "Claim your handle" button across the site opens a modal that captures
**email + desired @handle** and submits the payload to a configurable endpoint.

### Setup

The modal posts to whatever URL is set in the `PUBLIC_CLAIM_ENDPOINT`
environment variable. If unset, it logs the payload to the browser console
(useful for development). Set it in Vercel's Environment Variables UI, or in a
local `.env` file:

```bash
PUBLIC_CLAIM_ENDPOINT="https://your-webhook-or-form-endpoint"
```

### What gets sent

The modal sends a JSON POST with:

```json
{
  "handle": "hannah",
  "email": "hannah@example.com",
  "timestamp": "2026-05-06T03:42:11.123Z",
  "source": "sorted-landing"
}
```

### Where to point it

Pick whatever fits your stack:

- **Formspree** — easiest. Sign up, get a form ID, set
  `PUBLIC_CLAIM_ENDPOINT="https://formspree.io/f/{your-form-id}"`. Submissions
  show up in their dashboard, optionally forwarded to your inbox.
- **Zapier / Make** — webhook URL. Submissions can land in Google Sheets,
  Notion, Slack, Mailchimp, etc.
- **Your own API** — anything that accepts a JSON POST. For Vercel Serverless
  Functions, switch Astro to `output: 'hybrid'` mode and add an `/api/claim.ts`
  endpoint.

### Triggering the modal

Any element with the `data-claim` attribute opens the modal on click. Already
applied to all "Claim your handle" buttons globally (16 pages). To trigger
from a custom button:

```html
<a href="#" data-claim>Sign up</a>
```

