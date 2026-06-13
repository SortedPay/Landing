# Sorted Landing — Tweak Round 2 (SUPERSEDES Round 1)

If you have not pushed sorted-site-tweaks-r1.zip yet: push THIS instead,
it contains everything from r1 plus the card fix. If you already pushed
r1: push this anyway — same three files, they replace cleanly.

Drag the `src` folder onto the SortedPay/Landing repo root. Leave this
README out of the upload.

## New in r2 — the card, brand-corrected
- Wordmark is now the actual brand logotype: lowercase "sorted." with the
  full stop, Bricolage weight 700, -0.045em tracking — exactly matching
  the header logo spec. (It was title-case "Sorted" at 800 before — wrong
  case, wrong weight, no period. Fixed.)
- Optical size pinned (font-variation-settings: "opsz" 30). Bricolage
  ships as a variable font with an optical-size axis; at wordmark scale
  the browser was auto-selecting the large optical cut, whose glyph
  shapes differ from the logo. Pinning opsz makes the giant wordmark use
  the same glyphs as the logo, just bigger.
- Chip removed. Composition rebalanced: cropped wordmark top, dot-grid
  field, handle + TAP TO PAY + Mastercard marks bottom.

## Carried over from r1
1. Nan-section tiles rebuilt — one unified interior device (mono pill +
   display amount + branded button / SMS bubble), emoji gone.
2. Hero sub: "Send to any @handle in seconds. Tap to pay everywhere
   else. Free. Instant. Sorted." (+ meta description)
3. NEW "Backing the locals" section (#locals) — 6 dashed logo-slot tiles
   ready for partner logos.
4. Sorted+ teaser removed; third USP card now covers Sorted Points.
5. Socials: X only (Instagram + email gone, /security email replaced
   with X pointer).

## Files
src/pages/index.astro
src/components/Footer.astro
src/pages/security.astro
