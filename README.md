# Sorted Landing — Tweak Round 1 (post-pivot review)

THREE files changed. Drag the `src` folder onto the SortedPay/Landing repo
root (same flow as the pivot zip) — all three replace existing files.
Leave this README out of the upload.

## What changed
1. NAN SECTION TILES REDESIGNED — the three mismatched interior mockups
   (incl. the emoji phone) replaced with one unified device across all
   three cards: mono pill label + big display amount + branded button /
   SMS bubble. Cohesive, chunky, Sorted.
2. CARD MOCKUP v2 — giant lime "Sorted" wordmark spans the full card
   width, cropped halfway by the top edge (editorial crop). Lime dot-grid
   texture on the ink face (matches the app's balance card), bigger
   @handle, chip relocated. Scales fluidly via container units.
3. HERO SUB updated — now covers P2P AND tap-to-pay:
   "Send to any @handle in seconds. Tap to pay everywhere else.
    Free. Instant. Sorted." (meta description updated to match)
4. NEW "BACKING THE LOCALS" SECTION (id=#locals) — Sorted Perks story +
   6 dashed logo-slot tiles (Cafes/Pubs/Bakeries/Grocers/Barbers/
   Bookshops). Built as logo slots: when partner logos arrive, they drop
   straight into the tiles. Soft partner CTA pointing at X.
5. REPETITION CULLED — Sorted+ teaser section REMOVED (vague "coming
   soon" noise; locals takes its slot — easy to restore later if wanted).
   Third USP card no longer duplicates the Card section.
6. POINTS NOW COVERED ON THE HOMEPAGE — third USP card is the points
   story ("Oh, and normal stuff earns points") linking to #locals, on top
   of the card-section bullet and FAQ answer. All action-attached
   language (legal design law intact).
7. SOCIALS — X only. Instagram icon and email link removed from the
   footer; dead bug-bounty email on /security replaced with an X pointer.

## Files
src/pages/index.astro
src/components/Footer.astro
src/pages/security.astro

Verified: structure balanced, banned-language scan still clean, rendered
desktop + mobile before shipping.
