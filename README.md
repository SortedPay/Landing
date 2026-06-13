# Sorted Site — Pivot Release (yield removal + card/perks)

Drop-in update for SortedPay/Landing. **12 files.** Aligns the entire public
site with the post-legal-review direction in SORTED-PIVOT-BRIEF.md.

## URGENT CONTEXT
The live site advertises a 3.00% return across ~28 places. Legal advice says
Sorted cannot offer yield in Australia at this stage. Deploy this ASAP.

## What changed
- ALL yield/rate/interest claims removed from every page (verified by
  automated banned-language scan: zero remaining user-facing hits)
- New pillars: SEND -> TAP -> SORTED. Card/tap-to-pay is now a core feature
- New /card page (Card & Perks) replaces /earn; /earn now redirects to /card
- Nav + footer: "Earn 3.00%" -> "Card & Perks"
- Homepage: phone mockup shows a card tap + Sorted Points (no yield UI),
  earn section replaced by a Card section with CSS-drawn Sorted card mockup,
  marquee now "SEND · TAP · SORTED · FREE P2P · MADE IN AUS"
- Sorted Points introduced (subtle): points come from ACTIONS (sends, taps,
  referrals) — never from balance held. This wording is deliberate; keep it.
- Sorted Perks mentioned softly ("perks at local Aussie businesses")
- Sorted+ teaser rescoped: no yield hook (boosted points, free instant
  cashouts, custom handle colours)
- One roadmap-only yield mention (FAQ + /card page): "exploring ways to make
  idle balances do more, subject to the right regulatory settings. No
  promises, no fine print." NO rates, NO timelines. Do not strengthen this.
- Multi-currency: one subtle line — "AUDD-first, with USDC and USDT supported."
- why-sorted rewritten where it contradicted the new direction ("we don't
  have a card yet", "no streaks/gamification", savings-rate comparisons)
- receive: "Money in. Yield on." -> "Money in. Money usable."
- compliance: tax section now references a transaction statement (not
  interest); AFSL/AUSTRAC wording untouched pending lawyer review

## Files in this zip
src/components/Header.astro      (nav -> Card & Perks, type union 'earn'->'card')
src/components/Footer.astro      (tagline + link)
src/pages/index.astro            (homepage — biggest change)
src/pages/card.astro             (NEW — Card & Perks page)
src/pages/earn.astro             (now a meta-refresh redirect to /card)
src/pages/faq.astro              (rate Qs replaced w/ card + points Qs)
src/pages/why-sorted.astro
src/pages/how-it-works.astro
src/pages/compliance.astro
src/pages/security.astro
src/pages/receive.astro
src/pages/topup.astro
(send.astro untouched — verified clean)

## Deploy (same drag-drop flow as always)
1. github.com/SortedPay/Landing -> src -> components -> "Add file" ->
   "Upload files" -> drag BOTH files from src/components/ -> commit
2. Back to src -> pages -> "Add file" -> "Upload files" -> drag ALL TEN
   files from src/pages/ -> commit
   (card.astro shows as NEW/green; the rest show as modified/yellow)
3. Vercel deploys in ~60s. Verify in INCOGNITO.

## Post-deploy checklist
- Nav reads "Card & Perks" and routes to /card
- /earn redirects to /card
- Homepage: no rate anywhere; card mockup section renders; marquee updated
- Phone mockup: "+12 Sorted Points" pill, "Corner Cafe / Card tap" row
- FAQ "Will my balance ever earn anything?" gives the roadmap answer
- Hard-search the rendered pages for "3.00", "yield", "interest", "p.a." — zero hits

## LAWYER SIGN-OFF NEEDED (before or immediately after deploy)
1. compliance.astro — AFSL "authorised representative" + AUSTRAC claims are
   still present-tense; confirm or supply approved wording
2. terms + privacy pages — not yet drafted/reviewed; conservative drafts
   coming as the next deliverable for lawyer markup
3. The X pinned article still publicly promises 3.00% — replacement copy
   coming in the docs pass; consider unpinning today
