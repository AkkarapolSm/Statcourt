# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Audience — Thai Youth Student-Athletes (ม.ปลาย, U16/U18)**: Aspiring high school basketball players preparing for university admissions through TCAS sports quotas (โควตานักกีฬา). They need tamper-evident, verifiable match statistics, shot charts, and highlight reels that admissions committees and university coaches trust over paper score sheets or word-of-mouth.
- **Secondary Audience — University & Professional Scouts / Coaches**: Talent evaluators searching for provincial talent ("ช้างเผือก") across Thailand who need objective, FIBA-standard analytics (EFF, eFG%, TS%, Per-40), consistency ratings, and shot-by-shot video timestamps.
- **Supporting Actor — Courtside Table Officials & Referees**: Scorekeepers and organizers operating in noisy, time-pressured gymnasiums with unstable connectivity. They need a rapid-touch, error-resistant console with offline-first persistence and BSAT license verification.
- **Supporting Actor — Parents, Fans & Teammates**: Spectators following real-time game scores, streaming multi-camera footage, cheering team rosters, and participating in peer-to-peer equipment exchange.

## Product Purpose

StatCourtTH transforms raw grassroots basketball action in Thailand into verified digital credentials, objective scouting analytics, and life-changing higher education opportunities.

Success means:
1. High school student-athletes successfully secure university admissions via QR-verified TCAS portfolios backed by timestamped play-by-play game film.
2. Provincial athletes gain direct visibility to university and national scouts without geographical or economic barriers.
3. Tournament organizers and referees record complete, credible match histories with zero data loss, regardless of gymnasium connectivity.

## Positioning

"Statcourt คือพื้นที่ที่ผลงานในสนามกลายเป็นข้อมูลที่เข้าใจได้ และเป็นโอกาสต่อไปของนักบาสไทย" (Every game. More possibility / ทุกเกม มีความหมาย).

Unlike generic sports scoreboards or unverified social media highlight reels, StatCourtTH binds **BSAT-certified offline-first courtside scorekeeping** directly to **Hudl-grade play-by-play video timestamps** and **tamper-evident TCAS digital portfolios**. A neighboring tool cannot truthfully claim official event-level integrity coupled with university admission certification in Thailand.

## Operating Context

- **Gymnasiums & Benchside**: High-noise, fast-paced court environments with spotty Wi-Fi and mobile data. Scorekeepers work under extreme time constraints with wet or sweaty hands, requiring immediate tactile feedback, prominent 24s/14s shot clock triggers, and an instant Action Reversal Rail (Undo) to rectify mistakes without panic.
- **University Admissions & Scouting Review**: Evaluators reviewing athlete dossiers on desktops, tablets, printed sheets, or via QR codes on physical trading cards to inspect player consistency over 1M/6M/1Y/ALL timeframes.
- **Student-Athlete Peer Marketplace**: Safe, trusted peer exchange for authentic basketball shoes and gear, with item provenance linked to verified match appearances.

## Capabilities and Constraints

- **Confirmed Capabilities**:
  - Offline-first Courtside Official Console backed by IndexedDB queue and background sync when connection recovers.
  - Official FIBA LiveStats metric engine: FIBA Efficiency (EFF), Effective Field Goal Percentage (eFG%), True Shooting Percentage (TS%), Assist-to-Turnover Ratio, and FIBA Per-40 scaling.
  - 5-Zone Court Shot Charting (Paint Restricted, Mid-Range, Corner 3 Left/Right, Above the Break 3).
  - Event-to-Video Synchronization linking every point, foul, rebound, and turnover to `videoElapsedSec` in multi-cam recordings.
  - Automated TCAS Digital Portfolio and printable Trading Card generator with verification QR code and PDF export.
  - Role-Based Access Control (`ATHLETE`, `COACH`, `OFFICIAL`, `ADMIN`) with PIN-guarded referee authorization and tier sanitization.
- **Technical Constraints**:
  - Built on Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, Zustand, and `idb`.
  - Must remain strictly responsive from mobile screens (athletes, parents) to tablet/desktop interfaces (courtside table officials, scouts).

## Brand Commitments

- **Brand System**: "Courtside Editorial" — bridging the energetic grit of court culture with the editorial precision of FIBA analytics and sports journalism.
- **Color Tokens**:
  - Primary Brand Crimson: `#AF101A` (Primary buttons, key actions; requires white text for 7.21:1 contrast)
  - Court Ink: `#0B1C30` (Headings, tactical cards, broadcast surfaces)
  - Surface Base (Ice): `#F8F9FF` (Content reading background)
  - Signal Red: `#FF7A7A` (LIVE badges and status highlights on Court Ink backgrounds only; never use `#AF101A` on `#0B1C30`)
  - Border Strong: `#7F8A9E` (Controls, input fields, and borders needing >= 3:1 visibility)
  - Functional Accents: Medal Gold (`#FBBC30`), Verified Emerald (`#15803D`), Pending Amber (`#B45309`)
- **Typography Hierarchy**:
  - **Barlow Condensed**: English headings, jersey numbers, scores, and stat callouts (EFF, PPG, RPG).
  - **Noto Sans Thai**: Primary body copy, explanatory labels, and Thai headings.
- **Voice & Tone**: Authentic, authoritative, and empowering. Thai-first interface with standard international basketball abbreviations (PTS, REB, AST, EFF, 3PM, FT). Never condescending; celebrates grassroots dedication.

## Evidence on Hand

- Complete system architecture, metric formulas, and offline sync sequence in [`DESIGN.md`](file:///c:/Users/Asus/StatCourtTH/DESIGN.md).
- Detailed color contrast calculations, WCAG audit, and brand board analyses in [`docs/STATCOURT_BRAND_DIRECTION.md`](file:///c:/Users/Asus/StatCourtTH/docs/STATCOURT_BRAND_DIRECTION.md).
- Realistic seed fixtures, Thai school tournament structures (e.g. BCC vs. Debsirin), and sample play events in `prisma/seed.ts`.

## Product Principles

1. **Every Possession Counts (ทุกเพลย์มีคุณค่า)**: Every point, assist, and defensive effort contributes to an athlete's academic and athletic trajectory; data integrity and recording accuracy take precedence over decorative flair.
2. **Never Drop a Play (สนามไม่รอเน็ต)**: The court action moves forward without waiting for network connectivity; offline resilience is an unbreakable contract.
3. **Show the Proof Behind the Stat (ตัวเลขต้องมีหลักฐาน)**: Numbers alone do not persuade scouts or university committees; every key stat must anchor to verified official signatures and video moments.
4. **Athletic Dignity & High-Contrast Legibility (ความชัดเจนและเกียรติภูมิ)**: Interfaces must be legible across gym lighting and court distances; respect the athlete's craft through bold, distraction-free typographic hierarchy.

## Accessibility & Inclusion

- WCAG 2.1 AA compliance across light and dark contexts.
- Strict color contrast pairing: Signal Red (`#FF7A7A`) for dark tactical containers (6.80:1) and Brand Crimson (`#AF101A`) on light backgrounds (6.86:1). `#AF101A` is strictly prohibited as text or icons on Court Ink (`#0B1C30`).
- Statuses must always combine color with explicit text or icon indicators (e.g., "รับรองผลแล้ว", "รอตรวจสอบ").
- Minimum touch target size of 44×44px on all courtside controls.
