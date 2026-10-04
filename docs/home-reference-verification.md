# Homepage reference handoff

Scope: the homepage extension in `app/page.tsx`, guided by `docs/home-reference-direction.md`. This records the home surface only. Existing `PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json` remain authoritative and unchanged; no new global visual system was approved.

## Surface strategy

The supplied sports reference supplies the sequence and proportions: an oversized wordmark behind an isolated athlete, a quiet introduction, player analytics, audience stories, a wide opportunity banner, live information, FAQ, and a final invitation. StatCourt supplies the crimson, Court Ink, Ice, Barlow Condensed, and Noto Sans Thai. The sequence leads Thai basketball visitors from the sport to statistics and opportunities, with direct routes to live games, leaderboards, and organizer tools.

Desktop uses a centered 1280px stage, spacious editorial sections, and layered athlete imagery. At the home-specific 700px breakpoint, sections stack and hero copy sits below the visual region. These proportions, large wordmarks, 6px buttons, 10px feature containers, and local spacing are surface decisions, not replacements for the incumbent global scales. Existing schedules, leader filters, navigation, authentication, and member gates remain in the page composition. The analytics sheet explicitly labels its numbers as examples and links to real player statistics.

## Evidence and finish

Source comparison covered `app/page.tsx`, `components/home/HomeHeroSection.tsx`, `components/home/HomeStorySections.tsx`, `components/home/NewsAndOpportunitiesSection.tsx`, `app/globals.css`, and `tailwind.config.ts`, against the existing product and design records. The extension uses inherited brand values; Signal Red appears on dark backgrounds, crimson actions carry white labels, metric buttons have strong borders, and sample stat numerals use tabular spacing. FAQ uses native disclosure, metric buttons expose pressed state, and the scoped stylesheet includes focus-visible and reduced-motion handling.

The finish reviewer found the reference structure and retained brand successful. Its two news-image findings were fixed: the football thumbnail now uses the generated basketball athlete, and the missing thumbnail now uses the local hardwood court. News images have a local court fallback on loading failure; this was confirmed in source.

Recorded implementation verification:

- TypeScript check and targeted lint passed.
- Browser checks passed for the PTS/REB selector, FAQ disclosure, and mobile navigation menu.
- Measured no horizontal overflow at 1440px desktop and 390px mobile widths.
- Review captures are `.impeccable/review/desktop.png` and `.impeccable/review/mobile.png`; the implementation owner refreshes these same paths after final fixes.
- The generated `public/images/home/basketball-athlete.png` carries transparent alpha and the exact generation prompt in PNG metadata. The prompt is also retained in `docs/home-athlete-image-prompt.txt`; the shipping raster provenance scan was reported clear.
- The final isolated production build passed, including project lint, TypeScript validation, page generation, and build tracing, after restarting the pre-existing development preview that was writing into the same build directory.
- The production preview returned successful public match and leaderboard responses (38 matches and 10 requested leaders). The desktop search link remains accessible when the compact search form is hidden.

Browser outcomes, image metadata, provenance scan, and command results above were supplied by the implementation owner and finish review; this documentation pass independently checked the source and reference files, not another browser session.

Final reviewer disposition: ship. Both listed news-image fixes were scored resolved in refreshed desktop and mobile captures. The athlete was generated with the built-in Imagegen tool; its exact prompt is preserved in the linked prompt file and image metadata.

## Drift left outside the global system

The incumbent surface names already disagree: `DESIGN.md` assigns white to `surface-container` and `#e5eeff` to `surface-variant`, while root CSS and the flat Tailwind `surface-container` use `#e5eeff`; Tailwind `surface-variant` uses `#d3e4fe`. The nested Tailwind `surface.container` remains white. The homepage uses explicit inherited colors rather than resolving this pre-existing naming conflict.

The incumbent typography records also differ slightly: display frontmatter uses a 48–54px clamp with line-height 1.05, while the global display class steps from 48/52px to 54/56px at 1024px. Existing news and opportunity modules carry additional slate utilities, shadows, and editorial eyebrows. Neither these inherited choices nor the homepage's decorative type sizes and local muted shades have been promoted into normative tokens or repaired during this extension. Such reconciliation requires a separate system-change request.
