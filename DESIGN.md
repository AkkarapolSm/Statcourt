---
name: StatCourtTH
description: Elite Grassroots Basketball Analytics, Scouting & TCAS Athlete Hub
colors:
  primary: "#af101a"
  primary-pressed: "#8e0d15"
  primary-fixed: "#ffdad6"
  signal-red: "#ff7a7a"
  court-ink: "#0b1c30"
  inverse-surface: "#213145"
  surface-base: "#f8f9ff"
  surface-container: "#ffffff"
  surface-variant: "#e5eeff"
  border-neutral: "#dfe2eb"
  border-strong: "#7f8a9e"
  text-heading: "#0b1c30"
  text-secondary: "#5b6574"
  muted-on-ink: "#a9b6c8"
  medal-gold: "#fbbc30"
  verified-green: "#15803d"
  pending-amber: "#b45309"
typography:
  display:
    fontFamily: "Barlow Condensed, Noto Sans Thai, sans-serif"
    fontSize: "clamp(3rem, 5vw, 3.375rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0"
  headline:
    fontFamily: "Barlow Condensed, Noto Sans Thai, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0"
  title:
    fontFamily: "Barlow Condensed, Noto Sans Thai, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  stat:
    fontFamily: "Barlow Condensed, Noto Sans Thai, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
  body:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow Condensed, Noto Sans Thai, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "32px"
  gutter: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-pressed}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  card-tactical:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  badge-live:
    backgroundColor: "{colors.signal-red}"
    textColor: "{colors.court-ink}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

## Overview

**Creative North Star: "Courtside Editorial"**

StatCourtTH fuses the raw athletic urgency of courtside basketball with the analytical clarity of elite sports journalism and FIBA official records. The design system is built to honor the dedication of Thailand's youth players, turning every sprint, rebound, and clutch jumper into a verifiable, high-contrast digital asset for university scouts and TCAS admissions.

The visual atmosphere balances two distinct operational environments:
1. **The Reading Floor (Ice & Ink)**: A high-clarity daylight reading surface (`#F8F9FF` base with `#FFFFFF` cards and `#0B1C30` ink) optimized for coaches, scouts, and parents reviewing dense stat tables, shot charts, and player dossiers without visual fatigue.
2. **The Tactical Arena (Court Ink & Slate)**: A focused, high-contrast dark environment (`#0B1C30` with `#213145` overlays) dedicated to live game broadcasts, multi-camera film breakdown, and time-critical courtside scorekeeping.

**Key Characteristics:**
- High-contrast athletic typography featuring oversized display numerals and disciplined editorial line heights.
- Restrained, intentional color discipline: Brand Crimson (`#AF101A`) as the singular action accent, paired with Signal Red (`#FF7A7A`) exclusively on dark surfaces.
- Tactile, crisp layout geometry built from subtle court boundary lines rather than heavy decorative shadows.
- Bilingual Thai-English harmony, pairing **Barlow Condensed** for numerical authority with **Noto Sans Thai** for effortless textual legibility.

## Colors

The palette is engineered around high WCAG AA contrast, ensuring rapid recognition under variable gymnasium illumination and outdoor glare.

### Primary Roles
- **Brand Crimson** (`#AF101A`): Primary interactive brand color. Reserved for primary buttons, active tabs, and brand wordmarks. Requires white text (`#FFFFFF`) for an accessible 7.21:1 contrast ratio.
- **Crimson Pressed** (`#8E0D15`): Hover and pressed state for primary controls (9.47:1 against white).
- **Signal Red** (`#FF7A7A`): High-luminance warning and live status accent. Strictly reserved for LIVE indicators, pulse dots, and accent icons on dark Court Ink surfaces (6.80:1 contrast).
- **Court Ink** (`#0B1C30`): Dominant text color on light surfaces (16.34:1 on Ice) and primary background for video broadcast modules and tactical HUDs.

### Neutral & Surface Roles
- **Surface Base (Ice)** (`#F8F9FF`): The clean, glare-reducing canvas for general page layouts.
- **Surface Container (White)** (`#FFFFFF`): Elevated cards, box-score containers, and modal sheets.
- **Surface Variant (Tinted Ice)** (`#E5EEFF`): Subtle nested grouping containers and table header rows.
- **Inverse Surface (Tactical Slate)** (`#213145`): Video control rails, HUD overlays, and dropdown menus.
- **Border Strong** (`#7F8A9E`): High-visibility border token (3.31:1 on Ice) for inputs, select boxes, and button outlines.
- **Line / Border Neutral** (`#DFE2EB`): Low-contrast dividing rules (1.23:1) for table rows and subtle card separators.
- **Secondary Text** (`#5B6574`): Explanatory labels, timestamps, and secondary metadata (5.62:1 on Ice).
- **Muted on Ink** (`#A9B6C8`): Secondary descriptive text on dark Court Ink containers (8.35:1).

### Feedback & Status Roles
- **Verified Emerald** (`#15803D`): Official BSAT verification badges and certified game results.
- **Pending Amber** (`#B45309`): Provisional scorekeeping events and unverified athlete records awaiting official sign-off.
- **Medal Gold** (`#FBBC30`): Tournament trophies, MVP accolades, and championship achievements. Never pair with white text.

### Color Rules
- **The Signal Red Rule.** Never render brand crimson (`#AF101A`) as text, badges, or icons on Court Ink (`#0B1C30`); its 2.38:1 contrast fails accessibility standards. Always use Signal Red (`#FF7A7A`) for accents and LIVE indicators on dark surfaces (6.80:1).
- **The Status Pairing Rule.** Never convey game or verification status by color alone; every state badge must pair chromatic indication with explicit textual labels ("รับรองผลแล้ว", "รอตรวจสอบ", "LIVE").
- **The Control Border Rule.** Form inputs, filter pills, and interactive table controls must use Border Strong (`#7F8A9E`) to remain distinct on light backgrounds; reserve Line (`#DFE2EB`) strictly for decorative row separators.

## Typography

Typography establishes an immediate athletic rhythm. English metrics, scores, and jersey numbers employ condensed geometric letterforms, while Thai text remains open, human, and readable.

### Type Scale
- **Display (`font-headline-xl`)**: Barlow Condensed Bold, 48px mobile / 54px desktop (line-height: 56px). Used for hero headlines, major game scoreboards, and trading card title displays.
- **Headline (`font-headline-lg`)**: Barlow Condensed Bold, 36px (line-height: 40px). Page headers, tournament bracket titles, and primary stat callouts.
- **Title (`font-headline-md`)**: Barlow Condensed Bold, 24px (line-height: 28px). Card headings, modal headers, and table category splits.
- **Stat Value (`font-title-stat`)**: Barlow Condensed Bold, 32px (line-height: 32px, `tabular-nums`). High-density stat counters (EFF, PPG, RPG, APG).
- **Body Large (`font-body-lg`)**: Noto Sans Thai Medium, 16px (line-height: 24px). Lead paragraphs, emphasized table cells, and quotation callouts.
- **Body Regular (`font-body-md`)**: Noto Sans Thai Regular, 15px (line-height: 22px). Default editorial copy, athlete biographies, and forms.
- **Body Small (`font-body-sm`)**: Noto Sans Thai Regular, 13px (line-height: 18px). Timestamps, fine print, referee licenses, and table footnotes.
- **Label Caps (`font-label-caps`)**: Barlow Condensed Bold, 11px (letter-spacing: 0.08em). Categorical tags, metric labels (MIN, FGM/A, 3PM/A), and navigation eyebrows.
- **Label Badge (`font-label-badge`)**: Barlow Condensed Bold, 10px (letter-spacing: 0.06em). Status chips (LIVE, VERIFIED, PRO, TCAS).

### Typography Rules
- **The Dual-Font Rule.** Use Barlow Condensed exclusively for English headlines, scores, jersey numbers, and metric abbreviations; use Noto Sans Thai for all Thai copy, article bodies, and explanatory labels.
- **The No-Display-Tracking Rule.** Never add positive letter-spacing (`tracking-wide` or `tracking-widest`) to headline classes; Barlow Condensed has optimized metrics, and manual tracking degrades rendering for embedded Thai characters.
- **The Tabular Score Rule.** All game clocks, scoreboards, and stat columns must enforce tabular numerals (`tabular-nums` / `font-feature-settings: 'tnum'`) to prevent horizontal jitter during live scorekeeping updates.

## Layout

Layouts emphasize density, clarity, and structural balance, mimicking professional sports analytics boards and broadcast control rooms.

### Grid & Density
- **Container**: Max width `1280px` (`max-w-7xl`), centered with fluid horizontal padding (16px on mobile, 24px on desktop).
- **12-Column Grid**: Responsive multi-column layout for dashboard views, splitting into 8-column primary analytical view (game video or play-by-play) and 4-column secondary contextual rail (live box score or shot chart).
- **Spacing Steps**: Standardized on a 5-step scale: `xs` (4px), `sm` (8px), `md` (14px), `lg` (20px), `xl` (32px), with `gutter` (24px) for section divides.

### Layout Rules
- **The Court Spacing Rule.** Maintain strict structural rhythm: 4px for tight badge padding, 8px for element gaps, 14px for internal card padding, 20px for component separation, and 32px for section headers.
- **The Courtside Touch Rule.** All table official controls, shot clock triggers, and substitution buttons must maintain an interactive hit area of at least 44×44px to prevent miss-clicks in fast-paced gym environments.
- **The Asymmetric Broadcast Rail Rule.** In live match and video film pages, the video canvas maintains a 16:9 ratio and takes primary visual hierarchy; stat sheets and play feeds dock as a collapsible side rail without obscuring film controls.

## Elevation & Depth

StatCourtTH minimizes artificial drop shadows in favor of architectural border definition and tactical glassmorphism.

### Depth Vocabulary
- **Level 0 (Flat Ground)**: Surface Base (`#F8F9FF`) with no shadow.
- **Level 1 (Card Outline)**: Surface Container (`#FFFFFF`) with 1px `borderNeutral` (`#DFE2EB`). No shadow needed in daylight mode.
- **Level 2 (Tactical Glass)**: Tactical Slate (`#213145`) at 85% opacity with `backdrop-blur-md` and 1px `borderStrong` (`#7F8A9E`). Used for HUD controllers, floating stat cards, and video toolbars.
- **Level 3 (Modal Sheet)**: Elevated modals and popup menus using `shadow-xl` (`0 20px 25px -5px rgba(11, 28, 48, 0.1)`) with a dark backdrop overlay (`rgba(11, 28, 48, 0.6)`).

### Elevation Rules
- **The Tactical Outline Rule.** Prefer crisp 1px borders (`borderStrong` or `borderNeutral`) over drop shadows to delineate cards and tables; reserve box shadows exclusively for floating modals and player trading card hover elevation.
- **The Broadcast Frosted Rule.** Video HUD overlays and courtside stats superimposed on game film must use `backdrop-blur-md` with Tactical Slate (`rgba(33, 49, 69, 0.85)`) to preserve video legibility under fluctuating arena lighting.

## Shapes

Shapes communicate athletic precision through clean edges and controlled chamfers.

### Form Vocabulary
- **Sharp / None (`0px`)**: Table cell boundaries, division rules, and scoreboard time-tracks.
- **Small (`4px`)**: Buttons, input fields, filter chips, and status badges.
- **Medium (`6px`)**: Dropdown menus, tooltips, and tab switchers.
- **Large (`8px`)**: Match summary cards, athlete profile cards, and video containers.
- **Extra Large (`12px`)**: Hero spotlight banners and trading card containers.
- **Full (`9999px`)**: User avatars, team crest containers, and live radar pulse indicators.

### Shape Rules
- **The Athletic Chamfer Rule.** Keep corner radiuses disciplined between 4px (inputs, badges, buttons) and 8px (tactical cards); never use pill shapes (`rounded-full`) for primary data containers or tables.
- **The Geometry Over Ornament Rule.** Express basketball identity through thin court-line grids and coordinate markers rather than decorative basketball clip art or generic sports vectors.

## Components

The system implements a focused library of tactical components:

### Primary Button
- **Structure**: High-contrast rectangular button with 4px border radius and 10px 20px padding.
- **Appearance**: Crimson (`#AF101A`) background, white (`#FFFFFF`) text, Barlow Condensed Bold uppercase label.
- **Interaction**: Crimson Pressed (`#8E0D15`) on hover/active. Visible 2px focus ring (`#7F8A9E`).

### Secondary Outline Button
- **Structure**: Transparent background with 1px Border Strong (`#7F8A9E`).
- **Appearance**: Court Ink (`#0B1C30`) text on light surfaces; Muted on Ink (`#A9B6C8`) on dark surfaces.

### Live Match Ticker
- **Structure**: High-density horizontal ribbon docking scores, period markers, and time remaining.
- **Appearance**: Court Ink background, Signal Red live indicator dot with subtle radar pulse, white tabular team scores.

### Player Trading Card
- **Structure**: High-density 12px rounded card featuring athlete action portrait, physical measurements, QR verification code, and radar chart.
- **Appearance**: Court Ink header with golden medal accents, white stat grid, and verified green badge.

### Action Reversal Rail (Courtside Console)
- **Structure**: Prominent reversible action queue positioned immediately adjacent to the scoreboard.
- **Appearance**: Slate container with distinct undo triggers and clear player name/point tags to correct scorekeeper mistakes with zero panic.

### Component Rules
- **The Reversal Rail Rule.** Every courtside scorekeeper action must immediately surface in a tactile Undo stack with clear player and point attribution to prevent irreversible recording errors.
- **The Timestamp Scrub Rule.** Every play-by-play event row must render its video timestamp as an interactive trigger that seeks the film player directly to that second.

## Do's and Don'ts

### Do's
- **Do** use Barlow Condensed for all sports numerals, box-score headers, and scoreboards to achieve authentic athletic density.
- **Do** enforce `tabular-nums` on all countdown clocks, game times, and stat point counters.
- **Do** use Signal Red (`#FF7A7A`) exclusively on dark Court Ink surfaces to ensure WCAG AA compliance.
- **Do** pair every status color with clear textual labels (e.g. "รับรองผลแล้ว", "รอตรวจสอบ").
- **Do** maintain a minimum touch target size of 44×44px on all courtside official console buttons.
- **Do** anchor player statistics directly to video timestamps and official verification codes.

### Don'ts
- **Don't** use Brand Crimson (`#AF101A`) on Court Ink (`#0B1C30`); the 2.38:1 contrast fails legibility.
- **Don't** add manual positive letter-spacing (`tracking-wide`) to display headline utility classes.
- **Don't** use pill-shaped containers (`rounded-full`) for data tables, stat cards, or box-score wrappers.
- **Don't** apply heavy drop shadows; rely on 1px borders and tonal contrast for layout definition.
- **Don't** render unverified stats without an explicit "Pending Review" warning chip.
- **Don't** let network latency disrupt the scorekeeping flow; always record courtside actions offline-first.
