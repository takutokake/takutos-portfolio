# Takuto+ — interactive Featured work section

Date: 2026-11-12
Status: Approved design, pending implementation plan

## Goal

Replace the static Featured work section on `index.html` with **Takuto+**, a
personalized "streaming service" for Takuto's work. It should express his
personality (horse racing, travel, meeting people), show off his product skills
(personalization, discovery, community), and give visitors something to do,
not just read.

Resume line this enables: *"Designed and built takutokakeda.com, a personalized
'streaming service' portfolio that tailors content to each visitor's profile."*

## Scope

In scope:

- Replace only the `#work` section in `index.html`. Hero, story chapters, Current
  focus, About, and Contact keep their layout.
- The hero "Featured work" button and the nav "Work" link still target `#work`.
- Correct content that no longer matches the resume (see "Content corrections").

Out of scope:

- Rebuilding the rest of the homepage or the legacy pages (`work.html`,
  `about.html`, `snap-inc.html`, etc.).
- Any build tooling or framework. The site stays plain HTML, CSS, and JavaScript.

## Visitor experience

### 1. Who's watching?

The section opens on four profile tiles:

| Profile | Featured banner |
| --- | --- |
| Recruiter | HBO Max |
| Founder | Kroot |
| Community | ProductSC |
| Just curious | Race Day |

Picking a tile plays a short loading animation (under 1 second) and shows that
profile's home. A "Switch profile" control stays visible in the section. The
choice is saved in `localStorage` under `takutoPlus.profile` and restored on the
next visit, skipping the picker.

### 2. Personalized home

- A large featured banner at the top (title, one-line pitch, "Play" button that
  opens the title page). Its title depends on the profile, per the table above.
- Two rows of posters below it, named and ordered per profile (see "Catalog").
- The **Race Day** "LIVE" card is the first item in every profile's first row.
- Each poster shows a hand-set match score for the current profile, for example
  "97% match". Scores are fixed values in `catalog.js`, between 80 and 99.

### 3. Title page

Clicking a poster or the banner's Play button opens a detail view using the
existing expanding overlay from `premium.js`. It shows:

- Title, role, dates, tags.
- A two- or three-sentence description.
- An **episode list**: each episode is one real resume bullet, numbered
  `E1`, `E2`, …, with its headline metric.

Escape, the close button, and clicking the backdrop all close it. Focus returns
to the poster that opened it.

### 4. Race Day

- The six titles race as horses. Each horse has a name, silks color, and a
  "form guide" line made of that title's real stats.
- Intro line credits the Snap AR horse-racing lens Takuto built.
- The visitor picks one horse, then a race of about 10 seconds plays.
- The picked horse always wins. Positions are scripted so the race looks close
  (other horses lead at points; the pick overtakes in the final stretch).
- At the finish, the winner's title page opens with a "Winner's circle" banner.
  A "Race again" button resets the track.
- No money, odds, or betting language beyond "pick your horse".
- With `prefers-reduced-motion: reduce`, the animation is skipped and the
  finish order is shown immediately.

### 5. Guestbook ("Leave a review")

At the bottom of the section:

- Form fields: name (required, up to 40 characters), where you're from
  (optional, up to 40), note (required, up to 200), "What should Takuto build
  next?" (optional, up to 120).
- Approved notes scroll horizontally as a ticker. The ticker pauses on hover
  and focus, and is static under reduced motion.
- After submitting, the visitor sees: "Thanks! Your review will show up once
  Takuto approves it."

## Catalog

Six titles. Horse names are working names and can be changed in `catalog.js`.

| Title | Horse | Silks |
| --- | --- | --- |
| HBO Max (Warner Bros. Discovery) | Max Discovery | `#8b7cf7` |
| Kroot | Kroot Force | `#7bc47f` |
| ProductSC | Fight On Product | `#ff9e64` |
| Hearst | Front Page Fury | `#f7768e` |
| FEMO | Mentor Express | `#5eead4` |
| Bizlang | Jargon Buster | `#e0af68` |

Episodes, from the resume:

- **HBO Max**, Product Manager, Aug 2025 to present
  - E1 Search-to-discovery for kids: +5.4% minutes watched, +12% novel plays
  - E2 Opening 4,000+ unrated titles to teens with a rules + LLM classifier: +3% hours watched
  - E3 4-tier age model (186 genre tags) mapped to COPPA, BBFC, ClassInd, ACB, GCC
  - E4 Teen rail launch: +17% projected lift
  - E5 5 A/B tests across 12M+ users
  - E6 Kids & Family UAT across 11 new international markets
- **Kroot**, Founder, Feb 2026 to present
  - E1 Student recruiting OS: free job board plus a CRM that auto-tracks applications from Gmail
  - E2 Email-to-stage ML model trained on 3,000+ recruiting signals
  - E3 SOC 2 Type I; 300+ visitors in 20 days
  - E4 B2B model selling to schools
- **ProductSC**, President, Sep 2023 to Dec 2025
  - E1 Grew the club from 5 to 200+ members
  - E2 Designed three PM curricula: Compass, Catalyst, Client
  - E3 MRSO certification (1 of 16 clubs); partnerships with Amazon, Disney, Riot Games
- **Hearst**, Associate Product Manager, HomeCare HomeBase, Jun to Sep 2024
  - E1 Pricing and ROI model in Tableau supporting a $9M deal
  - E2 Requirements for an AI scheduling feature from the top 10 hospice clients
  - E3 Pitched a comic fan app; owned the concept and business case
- **FEMO**, Founder and Program Manager, Aug 2020 to May 2024
  - E1 English mentorship at 20 universities across 4 countries
  - E2 400+ volunteers and 24 staff
  - E3 Supported 200+ Tobitate! scholars (Japan's Ministry of Foreign Affairs)
- **Bizlang**, Buildspace S5, Aug 2023 to Aug 2024
  - E1 AI tool teaching workplace jargon to non-native English speakers
  - E2 Led 3 engineers through launch; 150+ users

Rows per profile (Race Day is prepended to the first row of each):

| Profile | Row 1 | Row 2 |
| --- | --- | --- |
| Recruiter | Top picks for Recruiters: HBO Max, Kroot, Hearst | By the numbers: ProductSC, FEMO, Bizlang |
| Founder | 0 → 1 Originals: Kroot, Bizlang, FEMO | Built at scale: HBO Max, Hearst, ProductSC |
| Community | Community Favorites: ProductSC, FEMO, Kroot | Where it led: HBO Max, Hearst, Bizlang |
| Just curious | Start here: FEMO, Kroot, HBO Max | More from Takuto: ProductSC, Bizlang, Hearst |

## Architecture

New files in `takutos-portfolio/`:

| File | Responsibility | Depends on |
| --- | --- | --- |
| `catalog.js` | All content: titles, episodes, horses, profiles, rows, match scores, sample reviews. Data only. | Nothing |
| `takuto-plus.js` | Profile picker, home, rows, banner, title page, saved profile | `catalog.js`, overlay in `premium.js` |
| `race-day.js` | Race Day card, track, pick, scripted animation, result | `catalog.js`; calls `takuto-plus.js` to open the winner |
| `guestbook.js` | Submit and load reviews, ticker | Supabase REST API |
| `takuto-plus.css` | Styles for all of the above, reusing variables from `premium.css` | `premium.css` |

Changes to existing files:

- `index.html`: replace the `#work` section markup; add the new stylesheet and
  scripts. The new markup includes the six titles as plain cards so the section
  still works without JavaScript; `takuto-plus.js` replaces them on load.
- `premium.js`: remove the `PROJECTS` object and the `[data-project]` click
  handlers. Expose the overlay open/close functions on `window.TakutoOverlay`
  so `takuto-plus.js` can fill and open it.

Modules communicate through globals on `window` (`TakutoCatalog`,
`TakutoOverlay`, `TakutoPlus`, `TakutoRace`), loaded with plain `<script>` tags
at the end of `<body>` in dependency order. No modules or bundler.
`catalog.js` and the race planning function in `race-day.js` also export
through `module.exports` when loaded by Node, so they can be unit tested with
`node --test`.

## Guestbook backend

Supabase (free tier), called with `fetch` against its REST API; no SDK.

```sql
create table public.reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 40),
  location    text check (char_length(location) <= 40),
  note        text not null check (char_length(note) between 1 and 200),
  build_next  text check (char_length(build_next) <= 120),
  approved    boolean not null default false
);

alter table public.reviews enable row level security;

create policy "public can submit unapproved reviews"
  on public.reviews for insert to anon
  with check (approved = false);

create policy "public can read approved reviews"
  on public.reviews for select to anon
  using (approved = true);
```

- No update or delete policy for `anon`, so the public key cannot change or
  remove anything.
- Takuto moderates by toggling `approved` in the Supabase table editor.
- The project URL and anon key live at the top of `guestbook.js`. The anon key
  is safe to publish because of the policies above.
- Spam controls: a hidden honeypot field (submissions with it filled are
  dropped client-side and shown the normal thank-you message), the database
  length checks, and a 60-second client cooldown stored in `localStorage`.
- The ticker loads the 30 newest approved reviews.

## Error handling

| Situation | Behavior |
| --- | --- |
| Reviews fail to load | Ticker shows three sample reviews from `catalog.js` |
| Submit fails | Form keeps its text; message: "Couldn't send that. Try again in a moment." |
| JavaScript disabled | Six titles render as a plain card grid with their descriptions |
| Reduced motion | No loading animation, no race animation, static ticker |
| Saved profile no longer exists | Clear it and show the picker |

## Accessibility

- Profile tiles, posters, and horses are `<button>` elements, reachable by Tab
  and activated by Enter or Space.
- Rows scroll horizontally with visible focus; the left/right buttons on each
  row have labels.
- The race result is announced in an `aria-live="polite"` region.
- Text and controls meet WCAG AA contrast against the dark background.

## Content corrections

Applied as part of this work:

- HBO Max role: "Product Intern" becomes "Product Manager".
- Elevait is replaced by Kroot in Featured work and in Current focus.
- About interests: horse racing, beatboxing, exploring cultures, cooking, group
  running, 2048 (replacing rock climbing and coffee).
- Contact email: `takuto.kakeda@gmail.com` (replacing `kakeda@usc.edu`).
- Story chapters, Current focus card 02, and About text: replace numbers and
  projects not on the resume (Homie, "50+ customer interviews", "50+ PM
  placements", "85% report new confidence", "100+ mentor pairs") with resume
  facts, and describe the minor as "AI Applications + Computer Programming".
- Timeline, matching the resume: 2026 founded Kroot; 2025 Product Manager at
  Warner Bros. Discovery (HBO Max); 2024 Hearst, Wellx.ai, Snap; 2023 President
  of ProductSC and started Bizlang; 2020 founded FEMO.

## Testing

Automated: `node --test tests/*.test.js` checks the catalog (every title, profile, row,
match score, and logo file is present and valid) and the race planner (the
pick always wins, never leads before the final stretch, and every horse's
progress only moves forward).

Manual, in a browser at a desktop width and a 390px phone width:

1. Each of the four profiles shows its banner, rows, and match scores as listed.
2. Reloading restores the saved profile; "Switch profile" returns to the picker.
3. Every poster opens the right title page; Escape and backdrop close it and
   return focus.
4. Race Day: picking each of the six horses makes that horse win and opens its
   title page; "Race again" resets.
5. Reduced motion (enabled in browser dev tools): race shows the result
   immediately and the ticker is static.
6. Keyboard only: every interaction above works without a mouse.
7. JavaScript disabled: the plain card grid appears.
8. Guestbook, against the real Supabase project:
   - A submitted review does not appear in the ticker.
   - After setting `approved = true` in the dashboard, it appears on reload.
   - Using the anon key with `curl`, selecting reviews returns only approved
     rows; inserting a row with `approved: true` is rejected; update and delete
     requests change nothing (re-selecting shows the same rows).
   - A submission with the honeypot filled is not stored.

## Inputs needed from Takuto

- A Supabase project with the SQL above run in its SQL editor, plus its
  project URL and publishable (anon) key.
- Kroot logo: provided, saved as `images/kroot-logo.png`.
- Optional: a horse-racing photo for the Race Day banner.
- Sign-off on horse names and match scores, or replacements.
