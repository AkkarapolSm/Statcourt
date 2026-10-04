# Market, athlete and leaderboard reference handoff

Scope: the ordinary extension described in [three-page-reference-direction.md](three-page-reference-direction.md) and `.impeccable/surfaces/app-marketplace-page-tsx.md`. The three user references supply composition; the existing Courtside Editorial brand supplies color, fonts and shared navigation. `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` remain authoritative and preserved. No global system replacement is recorded here.

## Source and brand evidence

This documentation pass independently inspected the direction records, product/design records, three new surface components, their parent pages, `app/sports-reference.css` and the layout import. It did not run another browser session or repeat the implementation owner's checks.

| Surface | Source relationship | Reference expression |
| --- | --- | --- |
| Market | `app/marketplace/page.tsx` supplies filtered listings and existing create, inquiry, history, terms and pricing handlers to `components/market/MarketStorefront.tsx`. | Headline and gear photograph, service strip, circular categories, product grid and two promotional panels. |
| Athlete | `app/athlete/[id]/page.tsx` supplies the athlete, active season statistics and permission-gated edit callback to `components/athlete/AthleteEditorialHero.tsx`. Existing detail sections remain below the hero. | Editorial headline, illustrative player, identity panel, season metrics and biography. |
| Leaderboard | `app/leaderboard/page.tsx` retains API loading, filters, sorting, pagination, tier access, CSV and report/pricing dialogs; `components/leaderboard/RankingBoard.tsx` presents these controls and records. | Compact heading and controls, dark ranking rows, metric columns and crimson EFF/G score blocks. |

`app/layout.tsx` imports the scoped stylesheet and continues loading Barlow Condensed and Noto Sans Thai. All three parent routes retain the shared `Navbar` and `Footer`. The stylesheet repeats the inherited crimson (`#af101a`), Court Ink (`#0b1c30`) and Ice (`#f8f9ff`), uses white labels on crimson fills, and uses lighter red for accents on navy. Numerals use tabular spacing. White profile/product planes and tonal navy ranking rows preserve the reading-floor/arena relationship in the incumbent design.

Compact labels, larger local hero lettering, selected navy tonal variations and surface-specific spacing are purposeful reference density and contrast choices. They have not been promoted into normative global tokens. The implementation owner reports one detector run with advisory palette/type findings and truncated output; it was not rerun or treated as a global drift repair request.

## Behavior and limits

- Market categories and search use the parent's filtered listing collection; the empty state resets both. Product prices come directly from `priceThb`; sold items disable inquiry. Listing quota and existing dialogs remain connected. Listings and inquiry submission remain local simulations, with a visible notice that no real payment occurs. Favorites are component state for the current page visit.
- Athlete identity and metrics come from the selected athlete/stat records. The hero discloses when a requested season has no statistics and a different season is displayed. The decorative player has empty image alt text and a visible illustration caption, so it is not presented as the athlete's identity portrait. Follow is in-page state; sharing copies the page URL with a fallback message. Existing overview, career, activity, shot chart, trend and logs remain connected, while owner-only TCAS/academic tabs and profile editing remain gated in the parent.
- Leaderboard records load from `/api/leaderboard`, with abort handling on season changes, loading/empty states and an explicitly labeled sample-data fallback. Ordering changes the displayed ranks without inventing movement. Pagination uses ten records per page. PRO metrics remain locked for free users and route to pricing. Each row links to its athlete profile.
- Responsive rules stack the Market panels and athlete stage, place ranking metrics beneath player names and keep category/position rails locally scrollable. Focus-visible styles and pressed states are present. The gear reveal runs only when reduced motion is not requested. These source observations do not constitute a comprehensive accessibility audit.

## Recorded verification

The following outcomes were supplied by the implementation owner:

- TypeScript without emission, targeted ESLint and the complete production build passed.
- Browser measurements at 1440px, 390px and the user's 313px width found no document horizontal overflow.
- Market: uniform filter produced one listing; reset restored six; search-empty state, pressed favorite state, inquiry opening and the free listing quota of 1/1 were checked.
- Leaderboard: seventeen API records; PPG ascending/descending; empty-state reset; second page ranks 11–17; card/row views; empty 2025 season; PRO pricing opening were checked.
- Athlete: season selection, career/overview switching and follow state were checked. Source inspection confirms the preserved role gates; no additional cross-role browser matrix is claimed.

Review JPEGs are stored under `.impeccable/review/three-pages/`. Current evidence excludes every `*round1*` file:

| Surface | Viewports | Scoped sections |
| --- | --- | --- |
| Market | `market-desktop.jpg`, `market-mobile.jpg`, `market-user313.jpg` | `market-desktop-products.jpg`, `market-desktop-promos.jpg`, `market-mobile-products.jpg`, `market-mobile-promos.jpg`, `market-mobile-footer.jpg`, `market-user313-products.jpg` |
| Athlete | `athlete-desktop.jpg`, `athlete-mobile.jpg`, `athlete-user313.jpg` | `athlete-desktop-stats.jpg`, `athlete-mobile-stats.jpg` |
| Leaderboard | `leaderboard-desktop.jpg`, `leaderboard-mobile.jpg`, `leaderboard-user313.jpg` | `leaderboard-mobile-pagination.jpg`, `leaderboard-mobile-footer.jpg` |

The documentation pass verified that these files exist. The in-app browser's full-page capture API was unavailable; these are viewport and scoped section captures, not full-page screenshots.

## Shipping imagery and finish

The generated Market campaign asset is `public/images/market/gear-hero.png`; its exact prompt is retained in [market-gear-image-prompt.txt](market-gear-image-prompt.txt). This pass independently read its PNG `impeccable:prompt` metadata and confirmed the retained prompt. The existing transparent player in `public/images/home/basketball-athlete.png` also retains its prompt metadata; its original handoff is [home-reference-verification.md](home-reference-verification.md), with the exact prompt in [home-athlete-image-prompt.txt](home-athlete-image-prompt.txt). Both assets are described as illustrations in the new surfaces. The implementation owner reports a shipping raster scan of two files with zero missing provenance entries.

The existing home handoff records pre-existing surface-name and display-scale differences between design records and implementation. They were not repaired or incorporated into global tokens by this extension.

Final fresh finish-review verdict: **pending**. This handoff records source relationships and reported verification; it will be updated when the finish reviewer supplies its disposition and any required corrections.
