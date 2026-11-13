# Takuto+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Featured work section of `index.html` with Takuto+, a personalized "streaming service" with a Race Day horse race and a moderated guestbook.

**Architecture:** Plain HTML, CSS, and JavaScript, no build step. Content lives in `catalog.js`; `takuto-plus.js` renders the profile picker, home, and rows; `race-day.js` runs the race; `guestbook.js` talks to Supabase's REST API. Files share state through `window.TakutoCatalog`, `window.TakutoOverlay`, `window.TakutoPlus`, and `window.TakutoRace`, loaded in order at the end of `<body>`. The title page reuses the existing expanding overlay in `premium.js`.

**Tech Stack:** HTML, CSS, vanilla JavaScript (ES2020), Supabase (Postgres + REST), Node 25 built-in test runner (`node --test`) for pure logic.

Spec: `docs/superpowers/specs/2026-11-12-takuto-plus-design.md`

## Global Constraints

- All paths are relative to `takutos-portfolio/`.
- No frameworks, bundlers, or npm dependencies.
- Only the `#work` section of `index.html` is replaced; plus the content corrections in Task 7 and the overlay markup in Task 3.
- Reuse CSS variables from `premium.css` (`--bg`, `--bg-soft`, `--ink`, `--ink-60`, `--line`, `--line-strong`, `--violet`, `--radius`, `--nav-h`, `--ease-out`, `--ease-spring`).
- Never insert visitor-provided text with `innerHTML`; use `textContent`.
- Every animation is skipped when `prefers-reduced-motion: reduce` is set.
- localStorage keys: `takutoPlus.profile`, `takutoPlus.lastReview`.
- Six title ids, in this order: `hbo`, `kroot`, `productsc`, `hearst`, `femo`, `bizlang`.
- Four profile ids, in this order: `recruiter`, `founder`, `community`, `curious`.
- Match scores are integers from 80 to 99.
- Guestbook limits: name 1–40, location ≤40, note 1–200, build_next ≤120 characters; 60-second cooldown.
- Thank-you copy: "Thanks! Your review will show up once Takuto approves it."
- Failure copy: "Couldn't send that. Try again in a moment."

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `catalog.js` | Create | All Takuto+ content. Data only. |
| `race-day.js` | Create | `planRace` (pure) and the Race Day view (`TakutoRace.mount`). |
| `takuto-plus.js` | Create | Picker, home, banner, rows, saved profile, `TakutoPlus.openTitle`. |
| `guestbook.js` | Create | Load approved reviews, ticker, submit form. |
| `takuto-plus.css` | Create | Styles for Takuto+, Race Day, guestbook, overlay episodes. |
| `tests/catalog.test.js` | Create | Catalog integrity. |
| `tests/race-day.test.js` | Create | Race planner rules. |
| `premium.js` | Modify | Remove `PROJECTS`; overlay takes data; expose `TakutoOverlay`. |
| `index.html` | Modify | New `#work` markup, overlay markup, scripts, content corrections. |

---

### Task 1: Catalog

**Files:**
- Create: `catalog.js`
- Test: `tests/catalog.test.js`

**Interfaces:**
- Produces: `TakutoCatalog` with
  - `titles: { [id]: { name, org, role, dates, logo, accent, pitch, desc, tags: string[], episodes: {title, metric}[], horse: {name, form} } }`
  - `profiles: { [id]: { label, blurb, icon, accent, featured: titleId | "race", rows: {title, items: titleId[]}[], match: { [titleId]: number } } }`
  - `race: { accent, pitch, intro }`
  - `sampleReviews: { name, location, note }[]`
  - Browser: `window.TakutoCatalog`. Node: `module.exports`.

- [ ] **Step 1: Write the failing test**

Create `tests/catalog.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../catalog.js");

const TITLE_IDS = ["hbo", "kroot", "productsc", "hearst", "femo", "bizlang"];

test("has the six titles in order", () => {
    assert.deepEqual(Object.keys(C.titles), TITLE_IDS);
});

test("every title is complete and its logo exists", () => {
    for (const id of TITLE_IDS) {
        const t = C.titles[id];
        for (const key of ["name", "org", "role", "dates", "logo", "accent", "pitch", "desc"]) {
            assert.ok(t[key], `${id}.${key}`);
        }
        assert.ok(t.tags.length > 0, `${id}.tags`);
        assert.ok(t.episodes.length > 0, `${id}.episodes`);
        for (const e of t.episodes) assert.ok(e.title && e.metric, `${id} episode`);
        assert.ok(t.horse.name && t.horse.form, `${id}.horse`);
        assert.ok(fs.existsSync(path.join(__dirname, "..", t.logo)), `${t.logo} exists`);
    }
});

test("profiles show every title once with valid match scores", () => {
    assert.deepEqual(Object.keys(C.profiles), ["recruiter", "founder", "community", "curious"]);
    for (const [pid, p] of Object.entries(C.profiles)) {
        assert.ok(p.label && p.blurb && p.icon && p.accent, `${pid} display fields`);
        assert.ok(p.featured === "race" || TITLE_IDS.includes(p.featured), `${pid}.featured`);
        assert.equal(p.rows.length, 2, `${pid} has two rows`);
        const shown = p.rows.flatMap((r) => r.items);
        assert.deepEqual([...shown].sort(), [...TITLE_IDS].sort(), `${pid} shows each title once`);
        for (const id of TITLE_IDS) {
            const m = p.match[id];
            assert.ok(Number.isInteger(m) && m >= 80 && m <= 99, `${pid}.match.${id} = ${m}`);
        }
    }
});

test("featured banners match the spec", () => {
    assert.equal(C.profiles.recruiter.featured, "hbo");
    assert.equal(C.profiles.founder.featured, "kroot");
    assert.equal(C.profiles.community.featured, "productsc");
    assert.equal(C.profiles.curious.featured, "race");
});

test("race copy credits Snap and sample reviews exist", () => {
    assert.ok(C.race.intro.includes("Snap"));
    assert.ok(C.race.accent && C.race.pitch);
    assert.ok(C.sampleReviews.length >= 3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/catalog.test.js`
Expected: FAIL with `Cannot find module '../catalog.js'`

- [ ] **Step 3: Write the catalog**

Create `catalog.js`:

```js
/* Takuto+ content: titles, profiles, Race Day, sample reviews */
(() => {
    "use strict";

    const TakutoCatalog = {
        titles: {
            hbo: {
                name: "HBO Max",
                org: "Warner Bros. Discovery",
                role: "Product Manager",
                dates: "Aug 2025 – Present",
                logo: "images/hbo-max-logo.webp",
                accent: "#8b7cf7",
                pitch: "Helping kids and teens find what to watch next on HBO Max.",
                desc: "I lead discovery and age-appropriate experiences for kids and teens on HBO Max. That means turning viewing data into product bets, partnering with legal on age rules around the world, and running experiments with 12M+ users.",
                tags: ["Personalization", "Kids & Family", "Streaming"],
                episodes: [
                    { title: "Search-to-discovery for kids", metric: "+5.4% minutes watched, +12% novel plays" },
                    { title: "Opening 4,000+ unrated titles to teens", metric: "Rules + LLM classifier with human review: +3% hours watched" },
                    { title: "A 4-tier age model for the world", metric: "186 genre tags mapped to COPPA, BBFC, ClassInd, ACB, and GCC" },
                    { title: "The teen rail", metric: "Co-led launch: +17% projected lift" },
                    { title: "Experiments at scale", metric: "5 A/B tests across 12M+ users" },
                    { title: "Going global", metric: "Kids & Family UAT across 11 new international markets" },
                ],
                horse: { name: "Max Discovery", form: "12M+ users · 5 A/B tests · 11 markets" },
            },
            kroot: {
                name: "Kroot",
                org: "krootme.com",
                role: "Founder",
                dates: "Feb 2026 – Present",
                logo: "images/kroot-logo.png",
                accent: "#7bc47f",
                pitch: "A student recruiting OS: a free job board plus a CRM that tracks applications from Gmail.",
                desc: "Kroot helps students run their job search like a pipeline. A free job board brings them in, and a CRM reads their Gmail to move each application to the right stage automatically. Next up: selling to schools to activate whole campuses.",
                tags: ["Founder", "AI", "0 → 1"],
                episodes: [
                    { title: "A recruiting OS for students", metric: "Free job board + CRM that auto-tracks applications via Gmail" },
                    { title: "Teaching email to read itself", metric: "Email-to-stage ML model trained on 3,000+ recruiting signals" },
                    { title: "Trust from day one", metric: "SOC 2 Type I; 300+ visitors in 20 days" },
                    { title: "Whole campuses", metric: "B2B model selling to schools, with employer integrations next" },
                ],
                horse: { name: "Kroot Force", form: "3,000+ signals · SOC 2 · 20 days" },
            },
            productsc: {
                name: "ProductSC",
                org: "USC",
                role: "President",
                dates: "Sep 2023 – Dec 2025",
                logo: "images/ProductSC-logo-website.png",
                accent: "#ff9e64",
                pitch: "Grew USC's product club from 5 to 200+ members.",
                desc: "I rebuilt ProductSC around three PM curricula, each for a different stage: Compass, Catalyst, and Client. That gave students a path from first curiosity to real client work, and gave partners a reason to show up.",
                tags: ["Community", "Curriculum", "Leadership"],
                episodes: [
                    { title: "From 5 to 200+", metric: "Grew membership 40×" },
                    { title: "Compass, Catalyst, Client", metric: "Three PM curricula for three stages of a PM career" },
                    { title: "Partners who showed up", metric: "MRSO certified (1 of 16 clubs); Amazon, Disney, Riot Games in half a year" },
                ],
                horse: { name: "Fight On Product", form: "5 → 200+ members · 3 curricula · 1 of 16" },
            },
            hearst: {
                name: "Hearst",
                org: "HomeCare HomeBase",
                role: "Associate Product Manager",
                dates: "Jun – Sep 2024",
                logo: "images/hearst-logo.jpg",
                accent: "#f7768e",
                pitch: "Pricing, AI scheduling, and a comic fan app pitch across two Hearst businesses.",
                desc: "At HomeCare HomeBase I turned client usage data into a pricing and ROI model, and turned hospice agencies' scheduling pain into requirements for an AI feature. On the side, I pitched a comic fan app to bring readers back.",
                tags: ["B2B SaaS", "Pricing", "Media"],
                episodes: [
                    { title: "Pricing that closed a deal", metric: "Tableau pricing + ROI model supporting a $9M deal" },
                    { title: "Scheduling, rethought with AI", metric: "Requirements from the top 10 hospice agency clients" },
                    { title: "Bringing comic readers back", metric: "Pitched a comic fan app; owned the concept and business case" },
                ],
                horse: { name: "Front Page Fury", form: "$9M deal · Top 10 clients · 1 pitch" },
            },
            femo: {
                name: "FEMO",
                org: "Foreign English Mentorship Organization",
                role: "Founder & Program Manager",
                dates: "Aug 2020 – May 2024",
                logo: "images/femo-logo.png",
                accent: "#5eead4",
                pitch: "English mentorship for students heading abroad, across 20 universities.",
                desc: "I founded FEMO to pair students preparing to study abroad with English-speaking mentors. It grew into a program across 4 countries, run by 400+ volunteers and 24 staff.",
                tags: ["Nonprofit", "Mentorship", "Cross-cultural"],
                episodes: [
                    { title: "Across borders", metric: "20 universities in 4 countries" },
                    { title: "Run by volunteers", metric: "400+ volunteers and 24 staff" },
                    { title: "Tobitate! scholars", metric: "Supported 200+ scholars from Japan's Ministry of Foreign Affairs" },
                ],
                horse: { name: "Mentor Express", form: "20 universities · 4 countries · 400+ volunteers" },
            },
            bizlang: {
                name: "Bizlang",
                org: "Buildspace S5",
                role: "Co-founder",
                dates: "Aug 2023 – Aug 2024",
                logo: "images/bizlang-website-logo.png",
                accent: "#e0af68",
                pitch: "An AI tool that teaches workplace jargon to non-native English speakers.",
                desc: "Bizlang helps non-native speakers decode the jargon that fills meetings and Slack threads. I led 3 engineers from idea to launch through Buildspace S5.",
                tags: ["AI", "Language", "Buildspace"],
                episodes: [
                    { title: "Decoding workplace jargon", metric: "AI tool for non-native English speakers" },
                    { title: "Idea to launch", metric: "Led 3 engineers; 150+ users" },
                ],
                horse: { name: "Jargon Buster", form: "150+ users · 3 engineers · S5" },
            },
        },

        profiles: {
            recruiter: {
                label: "Recruiter",
                blurb: "Impact first",
                icon: "💼",
                accent: "#8b7cf7",
                featured: "hbo",
                rows: [
                    { title: "Top picks for Recruiters", items: ["hbo", "kroot", "hearst"] },
                    { title: "By the numbers", items: ["productsc", "femo", "bizlang"] },
                ],
                match: { hbo: 98, kroot: 95, hearst: 92, productsc: 90, femo: 86, bizlang: 84 },
            },
            founder: {
                label: "Founder",
                blurb: "0 → 1 work",
                icon: "🚀",
                accent: "#7bc47f",
                featured: "kroot",
                rows: [
                    { title: "0 → 1 Originals", items: ["kroot", "bizlang", "femo"] },
                    { title: "Built at scale", items: ["hbo", "hearst", "productsc"] },
                ],
                match: { kroot: 99, bizlang: 94, femo: 90, hbo: 88, hearst: 85, productsc: 83 },
            },
            community: {
                label: "Community",
                blurb: "People and programs",
                icon: "🤝",
                accent: "#ff9e64",
                featured: "productsc",
                rows: [
                    { title: "Community Favorites", items: ["productsc", "femo", "kroot"] },
                    { title: "Where it led", items: ["hbo", "hearst", "bizlang"] },
                ],
                match: { productsc: 99, femo: 97, kroot: 92, bizlang: 88, hbo: 85, hearst: 82 },
            },
            curious: {
                label: "Just curious",
                blurb: "The fun side",
                icon: "✨",
                accent: "#5eead4",
                featured: "race",
                rows: [
                    { title: "Start here", items: ["femo", "kroot", "hbo"] },
                    { title: "More from Takuto", items: ["productsc", "bizlang", "hearst"] },
                ],
                match: { femo: 96, kroot: 94, hbo: 93, productsc: 91, bizlang: 89, hearst: 87 },
            },
        },

        race: {
            accent: "#ff9e64",
            pitch: "Six projects. One track. Pick the one you'd back and watch it run.",
            intro: "I once built a horse-racing AR lens at Snap. Now my projects race too: pick the one you'd back, and the winner gets the spotlight.",
        },

        sampleReviews: [
            { name: "Takuto", location: "Los Angeles", note: "Be the first to leave a review. I read every one." },
            { name: "Takuto", location: "Tokyo → LA", note: "Tell me where you're from. I collect places." },
            { name: "Takuto", location: "Santa Anita Park", note: "Which horse did you pick? Let me know below." },
        ],
    };

    if (typeof window !== "undefined") window.TakutoCatalog = TakutoCatalog;
    else module.exports = TakutoCatalog;
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/catalog.test.js`
Expected: PASS, 5 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add catalog.js tests/catalog.test.js images/kroot-logo.png
git commit -m "Add Takuto+ catalog with content tests"
```

---

### Task 2: Race planner

**Files:**
- Create: `race-day.js` (pure part only; the view is added in Task 5)
- Test: `tests/race-day.test.js`

**Interfaces:**
- Produces: `planRace(ids: string[], pickId: string, rand?: () => number) => { order: string[], frames: { [id]: number[] } }`
  - `frames[id]` has 6 values (checkpoints at 0, 20, 40, 60, 80, 100% of race time), each in `[0, 1]`, non-decreasing, starting at 0.
  - `order` is the finish order; `order[0] === pickId`.
  - Node: `module.exports = { planRace }`.

- [ ] **Step 1: Write the failing test**

Create `tests/race-day.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { planRace } = require("../race-day.js");

const IDS = ["hbo", "kroot", "productsc", "hearst", "femo", "bizlang"];
const seeded = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};
const leaderAt = (frames, k) =>
    Object.entries(frames).reduce((best, [id, f]) => (f[k] > frames[best][k] ? id : best), IDS[0]);

for (const pick of IDS) {
    test(`picking ${pick}: pick wins, finish order is consistent`, () => {
        for (let seed = 1; seed <= 25; seed++) {
            const { order, frames } = planRace(IDS, pick, seeded(seed));
            assert.equal(order[0], pick);
            assert.deepEqual([...order].sort(), [...IDS].sort());
            const finals = order.map((id) => frames[id][5]);
            assert.equal(finals[0], 1);
            for (let i = 1; i < finals.length; i++) assert.ok(finals[i] < finals[i - 1], "finals strictly descend");
        }
    });

    test(`picking ${pick}: progress only moves forward`, () => {
        for (let seed = 1; seed <= 25; seed++) {
            const { frames } = planRace(IDS, pick, seeded(seed));
            for (const id of IDS) {
                const f = frames[id];
                assert.equal(f.length, 6);
                assert.equal(f[0], 0);
                for (let k = 1; k < 6; k++) {
                    assert.ok(f[k] >= f[k - 1], `${id} k=${k}`);
                    assert.ok(f[k] <= 1);
                }
            }
        }
    });

    test(`picking ${pick}: pick does not lead before the final stretch`, () => {
        for (let seed = 1; seed <= 25; seed++) {
            const { frames } = planRace(IDS, pick, seeded(seed));
            for (let k = 1; k <= 4; k++) assert.notEqual(leaderAt(frames, k), pick, `seed ${seed} k=${k}`);
        }
    });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/race-day.test.js`
Expected: FAIL with `Cannot find module '../race-day.js'`

- [ ] **Step 3: Write the planner**

Create `race-day.js`:

```js
/* Race Day: the six titles race as horses; the visitor's pick always wins */
(() => {
    "use strict";

    const CHECKPOINTS = 6;

    const planRace = (ids, pickId, rand = Math.random) => {
        const others = ids.filter((id) => id !== pickId);
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }
        const finals = { [pickId]: 1 };
        others.forEach((id, i) => (finals[id] = 0.97 - i * 0.025));
        const pacer = others[0];

        const frames = {};
        for (const id of ids) {
            const out = [0];
            for (let k = 1; k < CHECKPOINTS - 1; k++) {
                const f = k / (CHECKPOINTS - 1);
                const swell = Math.sin(Math.PI * f);
                let p = finals[id] * f;
                if (id === pickId) p -= 0.05 * swell;
                else if (id === pacer) p += 0.06 * swell;
                else p += (rand() - 0.5) * 0.06 * swell;
                out.push(Math.min(finals[id] - 0.001, Math.max(out[k - 1] + 0.01, p)));
            }
            out.push(finals[id]);
            frames[id] = out;
        }
        return { order: [pickId, ...others], frames };
    };

    if (typeof window === "undefined") {
        module.exports = { planRace };
        return;
    }

    window.TakutoRace = { planRace };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/`
Expected: PASS, all catalog and race tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add race-day.js tests/race-day.test.js
git commit -m "Add Race Day planner where the pick always wins"
```

---

### Task 3: Overlay takes data

**Files:**
- Modify: `premium.js` (remove `PROJECTS` at lines 9–59; replace overlay section at lines 164–256)
- Modify: `index.html` (overlay body, lines 332–338)
- Create: `takuto-plus.css` (overlay episode styles only for now)

**Interfaces:**
- Produces: `window.TakutoOverlay.open(data, trigger: HTMLElement)` and `window.TakutoOverlay.close()`, where
  `data = { accent: string, banner: string, kicker: string, title: string, tags: string[], desc: string, episodes: {title, metric}[] }`.
  An empty `banner` hides the banner.

- [ ] **Step 1: Delete project data**

In `premium.js`, delete the whole `/* ---------- project data ---------- */` block (the `const PROJECTS = { … };` object, lines 9–59).

- [ ] **Step 2: Replace the overlay section**

In `premium.js`, replace everything from `/* ---------- expanding project overlay (FLIP) ---------- */` through the Escape `keydown` listener with:

```js
    /* ---------- expanding project overlay (FLIP) ---------- */
    const overlay = $("#project-overlay");
    const overlayCard = $("#project-overlay-card");
    let lastTrigger = null;

    const make = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };

    const fillOverlay = (d) => {
        overlayCard.style.setProperty("--pc", d.accent);
        $("#overlay-band").style.setProperty("--pc", d.accent);
        const banner = $("#overlay-banner");
        banner.textContent = d.banner || "";
        banner.hidden = !d.banner;
        $("#overlay-kicker").textContent = d.kicker;
        $("#overlay-title").textContent = d.title;
        $("#overlay-desc").textContent = d.desc;
        $("#overlay-tags").replaceChildren(...d.tags.map((t) => make("span", "tag", t)));
        $("#overlay-episodes").replaceChildren(
            ...d.episodes.map((e, i) => {
                const li = make("li");
                li.append(make("span", "ep-num", `E${i + 1}`), make("strong", null, e.title), make("span", "ep-metric", e.metric));
                return li;
            })
        );
    };

    const openOverlay = (data, trigger) => {
        fillOverlay(data);
        lastTrigger = trigger;
        overlay.hidden = false;
        document.body.classList.add("no-scroll");

        // FLIP: animate from the trigger's rect to the dialog's rect
        requestAnimationFrame(() => {
            overlay.classList.add("open");
            if (!reduceMotion && overlayCard.animate && trigger) {
                const from = trigger.getBoundingClientRect();
                const to = overlayCard.getBoundingClientRect();
                const sx = from.width / to.width;
                const sy = from.height / to.height;
                const dx = from.left + from.width / 2 - (to.left + to.width / 2);
                const dy = from.top + from.height / 2 - (to.top + to.height / 2);
                overlayCard.animate(
                    [
                        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.4 },
                        { transform: "none", opacity: 1 },
                    ],
                    { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
                );
            }
            $(".project-overlay-close", overlay).focus();
        });
    };

    const closeOverlay = () => {
        const target = lastTrigger && lastTrigger.isConnected ? lastTrigger : null;
        const finish = () => {
            overlay.classList.remove("open");
            overlay.hidden = true;
            document.body.classList.remove("no-scroll");
            if (target) target.focus({ preventScroll: true });
        };
        if (!reduceMotion && overlayCard.animate && target) {
            const to = target.getBoundingClientRect();
            const from = overlayCard.getBoundingClientRect();
            const sx = to.width / from.width;
            const sy = to.height / from.height;
            const dx = to.left + to.width / 2 - (from.left + from.width / 2);
            const dy = to.top + to.height / 2 - (from.top + from.height / 2);
            overlay.classList.remove("open"); // fades backdrop out alongside
            overlayCard
                .animate(
                    [
                        { transform: "none", opacity: 1 },
                        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0 },
                    ],
                    { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
                )
                .finished.then(finish, finish);
        } else {
            finish();
        }
    };

    $$("[data-close]", overlay).forEach((el) => el.addEventListener("click", closeOverlay));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlay.hidden) closeOverlay();
    });

    window.TakutoOverlay = { open: openOverlay, close: closeOverlay };
```

- [ ] **Step 3: Update overlay markup**

In `index.html`, replace:

```html
                <div class="project-overlay-body">
                    <p class="overlay-kicker" id="overlay-kicker"></p>
                    <h3 id="overlay-title"></h3>
                    <div class="overlay-tags" id="overlay-tags"></div>
                    <p class="overlay-desc" id="overlay-desc"></p>
                    <div class="overlay-stats" id="overlay-stats"></div>
                </div>
```

with:

```html
                <div class="project-overlay-body">
                    <p class="overlay-banner" id="overlay-banner" hidden></p>
                    <p class="overlay-kicker" id="overlay-kicker"></p>
                    <h3 id="overlay-title"></h3>
                    <div class="overlay-tags" id="overlay-tags"></div>
                    <p class="overlay-desc" id="overlay-desc"></p>
                    <ol class="overlay-episodes" id="overlay-episodes" aria-label="Episodes"></ol>
                </div>
```

- [ ] **Step 4: Add overlay episode styles**

Create `takuto-plus.css`:

```css
/* Takuto+ — personalized Featured work */

/* ---------- title page (overlay) ---------- */
.overlay-banner {
    display: inline-block;
    margin-bottom: 14px;
    padding: 6px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--pc) 25%, transparent);
    font-weight: 600;
    font-size: 0.85rem;
}
.overlay-banner[hidden] { display: none; }
.overlay-episodes { margin-top: 26px; padding: 0; list-style: none; display: grid; gap: 10px; }
.overlay-episodes li {
    display: grid;
    grid-template-columns: 44px 1fr;
    column-gap: 12px;
    row-gap: 2px;
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
}
.ep-num { grid-row: span 2; padding-top: 2px; color: var(--pc); font-weight: 700; font-size: 0.85rem; }
.ep-metric { color: var(--ink-60); font-size: 0.9rem; }
```

Add it to `<head>` in `index.html`, after `premium.css`:

```html
    <link rel="stylesheet" href="takuto-plus.css"/>
```

- [ ] **Step 5: Verify**

Run: `node --check premium.js`
Expected: no output (valid syntax).

Open `index.html` in a browser and run in the console:

```js
TakutoOverlay.open({ accent: "#8b7cf7", banner: "Test banner", kicker: "Kicker", title: "Title", tags: ["A"], desc: "Desc", episodes: [{ title: "Ep", metric: "+1%" }] }, document.querySelector("#nav .btn"));
```

Expected: overlay opens with the banner, one tag, and an `E1` episode row; Escape closes it and focus returns to "Get in touch". No console errors (the old work cards do nothing when clicked; Task 4 replaces them).

- [ ] **Step 6: Commit**

```bash
git add premium.js index.html takuto-plus.css
git commit -m "Let the project overlay render any title with episodes"
```

---

### Task 4: Takuto+ picker, home, and rows

**Files:**
- Create: `takuto-plus.js`
- Modify: `index.html` (`#work` section, lines 154–219; scripts at end of `<body>`)
- Modify: `takuto-plus.css` (append)

**Interfaces:**
- Consumes: `window.TakutoCatalog` (Task 1), `window.TakutoOverlay.open` (Task 3), `window.TakutoRace.mount(container, { onBack })` (Task 5; the Race Day card is clickable only once Task 5 lands, and calls are guarded until then).
- Produces: `window.TakutoPlus.openTitle(id: string, trigger: HTMLElement, opts?: { winner?: boolean })`.

- [ ] **Step 1: Replace the `#work` section**

In `index.html`, replace everything from `<!-- ============ FEATURED WORK ============ -->` up to (not including) `<!-- ============ CURRENT FOCUS ============ -->` with:

```html
        <!-- ============ FEATURED WORK: TAKUTO+ ============ -->
        <section class="work section" id="work">
            <div class="section-head">
                <p class="section-kicker reveal">Featured work</p>
                <h2 class="section-title reveal d-1">Now streaming on <span class="accent-serif">Takuto+</span>.</h2>
                <p class="section-sub reveal d-2">Pick who's watching and I'll line up the projects that matter to you. Or catch today's live race.</p>
            </div>

            <div class="tp-app" id="tp-app">
                <div class="tp-fallback">
                    <article class="tp-fallback-card"><img src="images/hbo-max-logo.webp" alt="HBO Max logo"/><h3>HBO Max</h3><p>Product Manager, Warner Bros. Discovery. Helping kids and teens find what to watch next.</p></article>
                    <article class="tp-fallback-card"><img src="images/kroot-logo.png" alt="Kroot logo"/><h3>Kroot</h3><p>Founder. A student recruiting OS: a free job board plus a CRM that tracks applications from Gmail.</p></article>
                    <article class="tp-fallback-card"><img src="images/ProductSC-logo-website.png" alt="ProductSC logo"/><h3>ProductSC</h3><p>President. Grew USC's product club from 5 to 200+ members.</p></article>
                    <article class="tp-fallback-card"><img src="images/hearst-logo.jpg" alt="Hearst logo"/><h3>Hearst</h3><p>Associate Product Manager. Pricing, AI scheduling, and a comic fan app pitch.</p></article>
                    <article class="tp-fallback-card"><img src="images/femo-logo.png" alt="FEMO logo"/><h3>FEMO</h3><p>Founder. English mentorship for students heading abroad, across 20 universities.</p></article>
                    <article class="tp-fallback-card"><img src="images/bizlang-website-logo.png" alt="Bizlang logo"/><h3>Bizlang</h3><p>Co-founder. An AI tool that teaches workplace jargon to non-native English speakers.</p></article>
                </div>
            </div>
        </section>

```

- [ ] **Step 2: Load the scripts**

In `index.html`, replace `<script src="premium.js"></script>` with:

```html
    <script src="catalog.js"></script>
    <script src="premium.js"></script>
    <script src="race-day.js"></script>
    <script src="takuto-plus.js"></script>
```

- [ ] **Step 3: Write `takuto-plus.js`**

```js
/* Takuto+: profile picker, personalized home, and rows */
(() => {
    "use strict";

    const C = window.TakutoCatalog;
    const app = document.getElementById("tp-app");
    if (!C || !app) return;

    const STORAGE_KEY = "takutoPlus.profile";
    const LOADER_MS = 700;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };
    const button = (className, text) => {
        const b = el("button", className, text);
        b.type = "button";
        return b;
    };
    const logo = (t) => {
        const img = el("img");
        img.src = t.logo;
        img.alt = `${t.name} logo`;
        img.loading = "lazy";
        return img;
    };
    const avatar = (p, className = "tp-avatar") => {
        const a = el("span", className, p.icon);
        a.style.setProperty("--pc", p.accent);
        a.setAttribute("aria-hidden", "true");
        return a;
    };

    const storage = {
        get: () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } },
        set: (v) => { try { localStorage.setItem(STORAGE_KEY, v); } catch { /* private mode */ } },
        clear: () => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ } },
    };

    let profileId = null;

    const openTitle = (id, trigger, { winner = false } = {}) => {
        const t = C.titles[id];
        if (!t || !window.TakutoOverlay) return;
        window.TakutoOverlay.open(
            {
                accent: t.accent,
                banner: winner ? `🏆 Winner's circle · ${t.horse.name}` : "",
                kicker: `${t.role} · ${t.org} · ${t.dates}`,
                title: t.name,
                tags: t.tags,
                desc: t.desc,
                episodes: t.episodes,
            },
            trigger
        );
    };

    const showRace = () => {
        if (!window.TakutoRace || !window.TakutoRace.mount) return;
        app.replaceChildren();
        window.TakutoRace.mount(app, { onBack: () => renderHome(profileId, { focus: true }) });
        app.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    const renderPoster = (id, p) => {
        const t = C.titles[id];
        const b = button("tp-poster");
        b.style.setProperty("--pc", t.accent);
        b.setAttribute("aria-haspopup", "dialog");
        const art = el("span", "tp-poster-art");
        art.append(logo(t));
        b.append(art, el("span", "tp-poster-name", t.name), el("span", "tp-poster-role", t.role), el("span", "tp-match", `${p.match[id]}% match`));
        b.addEventListener("click", () => openTitle(id, b));
        return b;
    };

    const renderRaceCard = () => {
        const b = button("tp-poster tp-poster-live");
        b.style.setProperty("--pc", C.race.accent);
        const art = el("span", "tp-poster-art", "🏇");
        art.setAttribute("aria-hidden", "true");
        b.append(art, el("span", "tp-live-badge", "Live"), el("span", "tp-poster-name", "Race Day"), el("span", "tp-poster-role", "Pick a horse"));
        b.addEventListener("click", showRace);
        return b;
    };

    const renderRow = (row, p, withRace) => {
        const section = el("section", "tp-row");
        section.setAttribute("aria-label", row.title);
        const track = el("div", "tp-row-track");
        const scroll = (dir) =>
            track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
        const prev = button("tp-row-btn", "‹");
        prev.setAttribute("aria-label", `Scroll ${row.title} left`);
        prev.addEventListener("click", () => scroll(-1));
        const next = button("tp-row-btn", "›");
        next.setAttribute("aria-label", `Scroll ${row.title} right`);
        next.addEventListener("click", () => scroll(1));
        const nav = el("div", "tp-row-nav");
        nav.append(prev, next);
        const head = el("div", "tp-row-head");
        head.append(el("h3", "tp-row-title", row.title), nav);
        if (withRace) track.append(renderRaceCard());
        track.append(...row.items.map((id) => renderPoster(id, p)));
        section.append(head, track);
        return section;
    };

    const renderBanner = (p) => {
        const isRace = p.featured === "race";
        const t = isRace ? null : C.titles[p.featured];
        const banner = el("div", isRace ? "tp-banner tp-banner-race" : "tp-banner");
        banner.style.setProperty("--pc", isRace ? C.race.accent : t.accent);

        const art = el("div", "tp-banner-art");
        if (isRace) {
            art.textContent = "🏇";
            art.setAttribute("aria-hidden", "true");
        } else {
            art.append(logo(t));
        }

        const play = button("btn btn-primary", isRace ? "▶ Watch live" : "▶ Play");
        if (isRace) {
            play.addEventListener("click", showRace);
        } else {
            play.setAttribute("aria-haspopup", "dialog");
            play.addEventListener("click", () => openTitle(p.featured, play));
        }
        const actions = el("div", "tp-banner-actions");
        actions.append(play);
        if (!isRace) actions.append(el("span", "tp-match", `${p.match[p.featured]}% match`));

        const body = el("div", "tp-banner-body");
        body.append(
            el("p", "tp-banner-kicker", isRace ? "Live event" : `Featured for ${p.label}`),
            el("h3", "tp-banner-title", isRace ? "Race Day" : t.name),
            el("p", "tp-banner-pitch", isRace ? C.race.pitch : t.pitch),
            actions
        );
        banner.append(art, body);
        return { banner, play };
    };

    const renderHome = (id, { focus = false } = {}) => {
        const p = C.profiles[id];
        profileId = id;
        const who = el("p", "tp-bar-who");
        who.append(avatar(p, "tp-avatar tp-avatar-sm"), `Watching as ${p.label}`);
        const sw = button("tp-switch", "Switch profile");
        sw.addEventListener("click", () => {
            storage.clear();
            profileId = null;
            renderPicker({ focus: true });
        });
        const bar = el("div", "tp-bar");
        bar.append(who, sw);
        const { banner, play } = renderBanner(p);
        app.replaceChildren(bar, banner, ...p.rows.map((row, i) => renderRow(row, p, i === 0)));
        if (focus) play.focus({ preventScroll: true });
    };

    const choose = (id) => {
        storage.set(id);
        if (reduceMotion) return renderHome(id, { focus: true });
        const loader = el("div", "tp-loader");
        loader.setAttribute("role", "status");
        loader.append(el("span", "tp-loader-ring"), el("span", null, `Loading ${C.profiles[id].label}…`));
        app.replaceChildren(loader);
        setTimeout(() => renderHome(id, { focus: true }), LOADER_MS);
    };

    const renderPicker = ({ focus = false } = {}) => {
        const grid = el("div", "tp-profiles");
        for (const [id, p] of Object.entries(C.profiles)) {
            const b = button("tp-profile");
            b.append(avatar(p), el("span", "tp-profile-label", p.label), el("span", "tp-profile-blurb", p.blurb));
            b.addEventListener("click", () => choose(id));
            grid.append(b);
        }
        const wrap = el("div", "tp-picker");
        wrap.append(el("h3", "tp-picker-title", "Who's watching?"), grid);
        app.replaceChildren(wrap);
        if (focus) grid.querySelector("button").focus({ preventScroll: true });
    };

    window.TakutoPlus = { openTitle };

    const saved = storage.get();
    if (saved && C.profiles[saved]) {
        renderHome(saved);
    } else {
        if (saved) storage.clear();
        renderPicker();
    }
})();
```

- [ ] **Step 4: Append Takuto+ styles**

Append to `takuto-plus.css`:

```css
/* ---------- app shell ---------- */
.tp-app { min-height: 420px; scroll-margin-top: calc(var(--nav-h) + 32px); }

/* no-JS fallback */
.tp-fallback { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
.tp-fallback-card { padding: 24px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg-soft); }
.tp-fallback-card img { width: 56px; height: 56px; padding: 6px; object-fit: contain; border-radius: 12px; background: #fff; }
.tp-fallback-card h3 { margin-top: 16px; font-size: 1.15rem; }
.tp-fallback-card p { margin-top: 6px; color: var(--ink-60); }

/* ---------- who's watching ---------- */
.tp-picker { padding: 40px 0; text-align: center; }
.tp-picker-title { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 600; letter-spacing: -0.02em; }
.tp-profiles { margin-top: 40px; display: flex; flex-wrap: wrap; justify-content: center; gap: 28px; }
.tp-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 150px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
}
.tp-profile:focus-visible { outline: none; }
.tp-avatar {
    display: grid;
    place-items: center;
    width: 120px;
    height: 120px;
    border: 3px solid transparent;
    border-radius: 22px;
    background: linear-gradient(145deg, var(--pc), color-mix(in srgb, var(--pc) 35%, var(--bg)));
    font-size: 52px;
    transition: transform 0.3s var(--ease-spring), border-color 0.2s;
}
.tp-profile:hover .tp-avatar,
.tp-profile:focus-visible .tp-avatar { transform: translateY(-4px) scale(1.04); border-color: var(--ink); }
.tp-profile-label { font-weight: 600; font-size: 1.05rem; }
.tp-profile-blurb { color: var(--ink-60); font-size: 0.85rem; }
.tp-avatar-sm { width: 30px; height: 30px; border: 0; border-radius: 8px; font-size: 16px; }

.tp-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; min-height: 420px; color: var(--ink-60); }
.tp-loader-ring {
    width: 44px;
    height: 44px;
    border: 3px solid var(--line-strong);
    border-top-color: var(--violet);
    border-radius: 50%;
    animation: tp-spin 0.8s linear infinite;
}
@keyframes tp-spin { to { transform: rotate(360deg); } }

/* ---------- home ---------- */
.tp-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.tp-bar-who { display: flex; align-items: center; gap: 10px; color: var(--ink-60); font-size: 0.95rem; }
.tp-switch {
    padding: 8px 14px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
}
.tp-switch:hover,
.tp-switch:focus-visible { background: rgba(255, 255, 255, 0.06); }

.tp-banner {
    display: grid;
    grid-template-columns: minmax(160px, 260px) 1fr;
    align-items: center;
    gap: 32px;
    padding: 32px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background:
        radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--pc) 28%, transparent), transparent 60%),
        var(--bg-soft);
}
.tp-banner-art { display: grid; place-items: center; aspect-ratio: 1; padding: 24px; border-radius: 18px; background: #fff; }
.tp-banner-art img { width: 100%; height: 100%; object-fit: contain; }
.tp-banner-race .tp-banner-art {
    background: linear-gradient(145deg, var(--pc), color-mix(in srgb, var(--pc) 30%, var(--bg)));
    font-size: 96px;
    transform: scaleX(-1);
}
.tp-banner-kicker { color: var(--pc); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
.tp-banner-title { margin-top: 8px; font-size: clamp(2rem, 4.5vw, 3.2rem); font-weight: 700; letter-spacing: -0.02em; }
.tp-banner-pitch { margin-top: 10px; max-width: 520px; color: var(--ink-60); }
.tp-banner-actions { margin-top: 22px; display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.tp-match { color: #46d369; font-size: 0.85rem; font-weight: 600; }

/* ---------- rows ---------- */
.tp-row { margin-top: 40px; }
.tp-row-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.tp-row-title { font-size: 1.2rem; font-weight: 600; }
.tp-row-nav { display: flex; gap: 8px; }
.tp-row-btn {
    width: 36px;
    height: 36px;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: transparent;
    color: var(--ink);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
}
.tp-row-btn:hover,
.tp-row-btn:focus-visible { background: rgba(255, 255, 255, 0.08); }
.tp-row-track { display: flex; gap: 16px; padding: 6px 2px 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: thin; }

.tp-poster {
    position: relative;
    flex: 0 0 220px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 0 0 14px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--bg-soft);
    color: var(--ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
    scroll-snap-align: start;
    transition: transform 0.3s var(--ease-out), border-color 0.2s;
}
.tp-poster:hover,
.tp-poster:focus-visible { transform: translateY(-4px); border-color: var(--pc); outline: none; }
.tp-poster-art {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 16 / 10;
    margin-bottom: 10px;
    padding: 18px 28px;
    border-bottom: 3px solid var(--pc);
    background: #fff;
}
.tp-poster-art img { width: 100%; height: 100%; object-fit: contain; }
.tp-poster-name,
.tp-poster-role,
.tp-poster .tp-match { padding: 0 14px; }
.tp-poster-name { font-weight: 600; }
.tp-poster-role { color: var(--ink-60); font-size: 0.85rem; }
.tp-poster-live .tp-poster-art {
    background: linear-gradient(145deg, var(--pc), color-mix(in srgb, var(--pc) 30%, var(--bg)));
    font-size: 56px;
}
.tp-live-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 3px 8px;
    border-radius: 6px;
    background: #e50914;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

@media (max-width: 720px) {
    .tp-banner { grid-template-columns: 1fr; padding: 22px; }
    .tp-banner-art { max-width: 200px; }
    .tp-profile { width: 120px; }
    .tp-avatar { width: 96px; height: 96px; font-size: 42px; }
    .tp-poster { flex-basis: 180px; }
}

@media (prefers-reduced-motion: reduce) {
    .tp-loader-ring { animation: none; }
    .tp-poster,
    .tp-avatar { transition: none; }
}
```

- [ ] **Step 5: Verify**

Run: `node --check takuto-plus.js && node --test tests/`
Expected: no syntax output; all tests pass.

In a browser (clear `localStorage` first):
1. "Who's watching?" shows four tiles; clicking Recruiter shows the loader, then the HBO Max banner, "Top picks for Recruiters" (Race Day card, HBO Max, Kroot, Hearst) and "By the numbers" (ProductSC, FEMO, Bizlang), each with a match score.
2. Clicking Play or a poster opens its title page with episodes; Escape returns focus to the poster.
3. Reload: the Recruiter home appears without the picker. "Switch profile" returns to the picker.
4. Repeat for Founder (Kroot banner), Community (ProductSC banner), Just curious (Race Day banner; "Watch live" does nothing until Task 5).
5. Disable JavaScript in dev tools and reload: the six fallback cards appear.

- [ ] **Step 6: Commit**

```bash
git add index.html takuto-plus.js takuto-plus.css
git commit -m "Add Takuto+ profile picker, personalized home, and rows"
```

---

### Task 5: Race Day view

**Files:**
- Modify: `race-day.js` (add the view below `planRace`)
- Modify: `takuto-plus.css` (append)

**Interfaces:**
- Consumes: `planRace` (Task 2), `window.TakutoCatalog` (Task 1), `window.TakutoPlus.openTitle` (Task 4).
- Produces: `window.TakutoRace.mount(container: HTMLElement, { onBack: () => void })`.

- [ ] **Step 1: Add the view**

In `race-day.js`, replace:

```js
    window.TakutoRace = { planRace };
```

with:

```js
    const RACE_MS = 10000;
    const HORSE_PX = 32;
    const PLACES = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };
    const button = (className, text) => {
        const b = el("button", className, text);
        b.type = "button";
        return b;
    };
    const position = (p) => `calc(${(p * 100).toFixed(2)}% - ${(p * HORSE_PX).toFixed(1)}px)`;

    const mount = (container, { onBack }) => {
        const C = window.TakutoCatalog;
        const ids = Object.keys(C.titles);
        let running = false;

        const wrap = el("div", "race");
        const back = button("tp-switch", "← Back to home");
        back.addEventListener("click", onBack);
        const head = el("div", "race-head");
        head.append(el("span", "race-live", "Live"), el("h3", "race-title", "Race Day"), back);

        const prompt = el("p", "race-prompt", "Pick your horse.");
        const status = el("p", "race-status");
        status.setAttribute("aria-live", "polite");
        const again = button("btn btn-ghost race-again", "Race again");
        again.hidden = true;

        const lanes = ids.map((id, i) => {
            const t = C.titles[id];
            const lane = el("div", "race-lane");
            lane.style.setProperty("--pc", t.accent);
            const place = el("span", "race-place");
            const pick = button("race-pick");
            pick.append(
                el("span", "race-gate", String(i + 1)),
                el("strong", "race-horse-name", t.horse.name),
                place,
                el("span", "race-form", `${t.name} · ${t.horse.form}`)
            );
            const horse = el("span", "race-horse", "🏇");
            horse.setAttribute("aria-hidden", "true");
            const run = el("div", "race-run");
            run.append(horse, el("span", "race-finish"));
            lane.append(pick, run);
            return { id, lane, pick, place, horse };
        });
        const track = el("div", "race-track");
        track.append(...lanes.map((l) => l.lane));

        const finish = (plan) => {
            if (!wrap.isConnected) return;
            plan.order.forEach((id, i) => {
                const l = lanes.find((x) => x.id === id);
                l.horse.getAnimations().forEach((a) => a.cancel());
                l.horse.style.left = position(plan.frames[id][plan.frames[id].length - 1]);
                l.place.textContent = PLACES[i];
            });
            const winner = lanes.find((l) => l.id === plan.order[0]);
            winner.lane.classList.add("is-winner");
            const t = C.titles[winner.id];
            status.textContent = `${t.horse.name} wins! Here's the ${t.name} story.`;
            again.hidden = false;
            setTimeout(() => {
                if (wrap.isConnected) window.TakutoPlus.openTitle(winner.id, again, { winner: true });
            }, reduceMotion ? 0 : 700);
        };

        const start = (id) => {
            if (running) return;
            running = true;
            lanes.forEach((l) => (l.pick.disabled = true));
            lanes.find((l) => l.id === id).lane.classList.add("is-pick");
            prompt.textContent = `You picked ${C.titles[id].horse.name}. And they're off!`;
            const plan = planRace(ids, id);
            if (reduceMotion || !Element.prototype.animate) return finish(plan);
            const runs = lanes.map((l) =>
                l.horse.animate(
                    plan.frames[l.id].map((p) => ({ left: position(p) })),
                    { duration: RACE_MS, easing: "linear", fill: "forwards" }
                )
            );
            Promise.all(runs.map((a) => a.finished)).then(() => finish(plan), () => {});
        };

        lanes.forEach((l) => l.pick.addEventListener("click", () => start(l.id)));

        again.addEventListener("click", () => {
            running = false;
            lanes.forEach((l) => {
                l.pick.disabled = false;
                l.lane.classList.remove("is-pick", "is-winner");
                l.horse.style.left = "";
                l.place.textContent = "";
            });
            prompt.textContent = "Pick your horse.";
            status.textContent = "";
            again.hidden = true;
            lanes[0].pick.focus();
        });

        wrap.append(head, el("p", "race-intro", C.race.intro), prompt, track, status, again);
        container.append(wrap);
        lanes[0].pick.focus({ preventScroll: true });
    };

    window.TakutoRace = { planRace, mount };
```

- [ ] **Step 2: Append race styles**

Append to `takuto-plus.css`:

```css
/* ---------- race day ---------- */
.race-head { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.race-head .tp-switch { margin-left: auto; }
.race-live {
    padding: 3px 8px;
    border-radius: 6px;
    background: #e50914;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.race-title { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 700; letter-spacing: -0.02em; }
.race-intro { margin-top: 10px; max-width: 620px; color: var(--ink-60); }
.race-prompt { margin-top: 20px; font-weight: 600; }
.race-track {
    margin-top: 16px;
    display: grid;
    gap: 10px;
    padding: 16px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: linear-gradient(180deg, #0d2a17, #0a1f12);
}
.race-lane { display: grid; grid-template-columns: minmax(180px, 260px) 1fr; align-items: center; gap: 14px; }
.race-pick {
    display: grid;
    grid-template-columns: 26px 1fr auto;
    column-gap: 10px;
    padding: 8px 12px;
    border: 1px solid var(--line-strong);
    border-left: 4px solid var(--pc);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.25);
    color: var(--ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
}
.race-pick:hover:not(:disabled),
.race-pick:focus-visible { background: rgba(255, 255, 255, 0.08); }
.race-pick:disabled { cursor: default; }
.race-gate {
    grid-row: span 2;
    align-self: center;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--pc);
    color: var(--bg);
    font-size: 0.8rem;
    font-weight: 700;
}
.race-horse-name { font-size: 0.95rem; }
.race-place { grid-row: span 2; align-self: center; color: var(--ink-60); font-size: 0.8rem; font-weight: 700; }
.race-form { color: var(--ink-60); font-size: 0.75rem; }
.race-run { position: relative; height: 40px; border-bottom: 1px dashed rgba(255, 255, 255, 0.15); }
.race-horse { position: absolute; bottom: 2px; left: 0; width: 32px; font-size: 28px; line-height: 1; transform: scaleX(-1); }
.race-finish {
    position: absolute;
    top: -6px;
    right: 0;
    bottom: -6px;
    width: 6px;
    background: repeating-linear-gradient(0deg, #fff 0 6px, #111 6px 12px);
    opacity: 0.8;
}
.race-lane.is-pick .race-pick { border-color: var(--pc); background: color-mix(in srgb, var(--pc) 22%, transparent); }
.race-lane.is-winner .race-place { color: #ffd166; }
.race-status { margin-top: 14px; min-height: 1.5em; font-weight: 600; }
.race-again { margin-top: 6px; }
.race-again[hidden] { display: none; }

@media (max-width: 720px) {
    .race-lane { grid-template-columns: 1fr; gap: 6px; }
    .race-run { height: 32px; }
}
```

- [ ] **Step 3: Verify**

Run: `node --check race-day.js && node --test tests/`
Expected: no syntax output; all tests still pass (the `window` guard keeps Node on the planner path).

In a browser:
1. Click the Race Day card: the race view replaces the rows; focus is on horse 1.
2. Pick each horse in turn: the race runs about 10 seconds, another horse leads until the final stretch, the pick wins, places show 1st–6th, the status line announces the winner, and the winner's title page opens with the "Winner's circle" banner.
3. Close the title page: focus lands on "Race again"; clicking it resets the track.
4. Click "Back to home" mid-race: the home returns and no title page opens later.
5. Enable "prefers-reduced-motion: reduce" in dev tools (Rendering panel) and reload: picking a horse shows the result immediately.

- [ ] **Step 4: Commit**

```bash
git add race-day.js takuto-plus.css
git commit -m "Add the Race Day view with scripted finish"
```

---

### Task 6: Guestbook

**Files:**
- Create: `guestbook.js`
- Modify: `index.html` (inside `#work`, after `#tp-app`; scripts)
- Modify: `takuto-plus.css` (append)

**Interfaces:**
- Consumes: `window.TakutoCatalog.sampleReviews` (Task 1).
- Produces: nothing for other files.

- [ ] **Step 1: Create the Supabase table**

In the Supabase dashboard, open **SQL Editor** and run:

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

Expected: "Success. No rows returned."

From **Project Settings → API**, copy the project URL and the publishable (anon) key.

- [ ] **Step 2: Add the guestbook markup**

In `index.html`, inside `#work`, directly after the closing `</div>` of `<div class="tp-app" id="tp-app">`, add:

```html
            <div class="tp-guestbook" id="tp-guestbook" hidden>
                <div class="tp-guestbook-head">
                    <h3>Leave a review</h3>
                    <p>Tell me where you're from, what you thought, or what I should build next.</p>
                </div>
                <div class="tp-ticker" tabindex="0" aria-label="Visitor reviews">
                    <ul class="tp-ticker-track" id="tp-ticker-track"></ul>
                </div>
                <form class="tp-review-form glass" id="tp-review-form">
                    <label class="tp-field">Name<input name="name" required maxlength="40" autocomplete="name"/></label>
                    <label class="tp-field">Where you're from<input name="location" maxlength="40" placeholder="Optional"/></label>
                    <label class="tp-field tp-field-wide">Your review<textarea name="note" required maxlength="200" rows="3"></textarea></label>
                    <label class="tp-field tp-field-wide">What should Takuto build next?<input name="build_next" maxlength="120" placeholder="Optional"/></label>
                    <div class="tp-hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"/></label></div>
                    <div class="tp-review-actions">
                        <button class="btn btn-primary" type="submit"><span>Post review</span></button>
                        <p class="tp-review-status" id="tp-review-status" role="status"></p>
                    </div>
                </form>
            </div>
```

Add the script after `takuto-plus.js`:

```html
    <script src="guestbook.js"></script>
```

- [ ] **Step 3: Write `guestbook.js`**

Fill in `SUPABASE_URL` and `SUPABASE_KEY` with the values from Step 1.

```js
/* Guestbook: visitor reviews, shown after Takuto approves them */
(() => {
    "use strict";

    // The publishable key is safe in the browser: row-level security only
    // allows inserting unapproved reviews and reading approved ones.
    const SUPABASE_URL = "";
    const SUPABASE_KEY = "";

    const COOLDOWN_MS = 60000;
    const COOLDOWN_KEY = "takutoPlus.lastReview";
    const THANKS = "Thanks! Your review will show up once Takuto approves it.";
    const FAILED = "Couldn't send that. Try again in a moment.";

    const C = window.TakutoCatalog;
    const root = document.getElementById("tp-guestbook");
    if (!C || !root) return;
    root.hidden = false;

    const form = root.querySelector("#tp-review-form");
    const status = root.querySelector("#tp-review-status");
    const track = root.querySelector("#tp-ticker-track");
    const submit = form.querySelector('button[type="submit"]');
    const configured = Boolean(SUPABASE_URL && SUPABASE_KEY);

    const headers = () => {
        const h = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
        if (SUPABASE_KEY.startsWith("eyJ")) h.Authorization = `Bearer ${SUPABASE_KEY}`;
        return h;
    };

    const say = (message, isError = false) => {
        status.textContent = message;
        status.classList.toggle("is-error", isError);
    };

    const reviewItem = (r, duplicate) => {
        const li = document.createElement("li");
        li.className = "tp-review";
        if (duplicate) li.setAttribute("aria-hidden", "true");
        const note = document.createElement("p");
        note.textContent = `“${r.note}”`;
        const who = document.createElement("span");
        who.textContent = r.location ? `${r.name} · ${r.location}` : r.name;
        li.append(note, who);
        return li;
    };

    const renderTicker = (reviews) => {
        track.replaceChildren(
            ...reviews.map((r) => reviewItem(r, false)),
            ...reviews.map((r) => reviewItem(r, true))
        );
    };

    const load = async () => {
        if (!configured) return renderTicker(C.sampleReviews);
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/reviews?select=name,location,note&order=created_at.desc&limit=30`,
                { headers: headers() }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const rows = await res.json();
            renderTicker(rows.length ? rows : C.sampleReviews);
        } catch {
            renderTicker(C.sampleReviews);
        }
    };

    const lastSent = () => {
        try { return Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch { return 0; }
    };
    const markSent = () => {
        try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* private mode */ }
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const text = (key) => String(data.get(key) || "").trim();

        if (text("website")) {
            form.reset();
            return say(THANKS);
        }
        if (Date.now() - lastSent() < COOLDOWN_MS) {
            return say("You just left a review. Give it a minute before sending another.", true);
        }
        const review = {
            name: text("name"),
            location: text("location") || null,
            note: text("note"),
            build_next: text("build_next") || null,
        };
        if (!review.name || !review.note) return say("Add your name and a review first.", true);
        if (!configured) return say(FAILED, true);

        submit.disabled = true;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
                method: "POST",
                headers: { ...headers(), Prefer: "return=minimal" },
                body: JSON.stringify(review),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            form.reset();
            markSent();
            say(THANKS);
        } catch {
            say(FAILED, true);
        } finally {
            submit.disabled = false;
        }
    });

    load();
})();
```

- [ ] **Step 4: Append guestbook styles**

Append to `takuto-plus.css`:

```css
/* ---------- guestbook ---------- */
.tp-guestbook { margin-top: 72px; }
.tp-guestbook[hidden] { display: none; }
.tp-guestbook-head h3 { font-size: 1.5rem; font-weight: 600; }
.tp-guestbook-head p { margin-top: 6px; color: var(--ink-60); }

.tp-ticker {
    margin-top: 22px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.tp-ticker:focus-visible { outline: 2px solid var(--violet); outline-offset: 4px; }
.tp-ticker-track { display: flex; width: max-content; margin: 0; padding: 0; list-style: none; animation: tp-ticker 60s linear infinite; }
.tp-ticker:hover .tp-ticker-track,
.tp-ticker:focus-within .tp-ticker-track { animation-play-state: paused; }
@keyframes tp-ticker { to { transform: translateX(-50%); } }
.tp-review {
    flex: 0 0 300px;
    margin-right: 14px;
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--bg-soft);
}
.tp-review p { font-size: 0.95rem; }
.tp-review span { display: block; margin-top: 8px; color: var(--ink-60); font-size: 0.8rem; }

.tp-review-form { position: relative; margin-top: 26px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 24px; border-radius: var(--radius); }
.tp-field { display: grid; gap: 6px; color: var(--ink-60); font-size: 0.85rem; }
.tp-field-wide { grid-column: 1 / -1; }
.tp-field input,
.tp-field textarea {
    padding: 10px 12px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    color: var(--ink);
    font: inherit;
    font-size: 0.95rem;
}
.tp-field textarea { min-height: 90px; resize: vertical; }
.tp-field input:focus-visible,
.tp-field textarea:focus-visible { outline: 2px solid var(--violet); outline-offset: 1px; }
.tp-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.tp-review-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.tp-review-status { color: var(--mint); font-size: 0.9rem; }
.tp-review-status.is-error { color: var(--coral); }

@media (max-width: 720px) {
    .tp-review-form { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
    .tp-ticker { overflow-x: auto; }
    .tp-ticker-track { animation: none; }
    .tp-review[aria-hidden="true"] { display: none; }
}
```

- [ ] **Step 5: Verify row-level security**

Run (with the real values):

```bash
URL="https://<project>.supabase.co"; KEY="<publishable key>"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL/rest/v1/reviews" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"name":"rls test","note":"should be hidden"}'
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL/rest/v1/reviews" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"name":"rls test","note":"self-approve","approved":true}'
curl -s "$URL/rest/v1/reviews?select=name,note" -H "apikey: $KEY"
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH "$URL/rest/v1/reviews?name=eq.rls%20test" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"approved":true}'
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$URL/rest/v1/reviews?id=gt.0" -H "apikey: $KEY"
curl -s "$URL/rest/v1/reviews?select=name,note" -H "apikey: $KEY"
```

Expected, in order: `201`; `401` or `403` (self-approval rejected); `[]`; `204` with nothing changed; `204` with nothing deleted; `[]`. Then in the Supabase table editor, the one "rls test" row exists with `approved = false`; delete it there.

If your key starts with `eyJ`, add `-H "Authorization: Bearer $KEY"` to each command.

- [ ] **Step 6: Verify in the browser**

1. The guestbook appears below Takuto+ with the three sample reviews scrolling; hovering pauses them.
2. Submit a review: the thank-you message shows and it does not appear in the ticker.
3. In Supabase, set that row's `approved` to true; reload: it appears in the ticker.
4. Submit again within a minute: the cooldown message shows.
5. Set a wrong `SUPABASE_URL` temporarily: the ticker falls back to the samples and submitting shows the failure message with the text kept. Restore the URL.
6. With reduced motion on, the ticker is static and scrollable, with no duplicate cards.

- [ ] **Step 7: Commit**

```bash
git add guestbook.js index.html takuto-plus.css
git commit -m "Add the moderated Takuto+ guestbook"
```

---

### Task 7: Content corrections

**Files:**
- Modify: `index.html` (Current focus, About, Contact)

- [ ] **Step 1: Current focus card 01**

Replace:

```html
                    <h3>Building Elevait</h3>
                    <p>Taking an AI product from zero to one — talking to users, shipping weekly, and staying close to the problem of finding what's next.</p>
```

with:

```html
                    <h3>Building Kroot</h3>
                    <p>Taking a student recruiting OS from zero to one: a free job board, a CRM that reads Gmail, and next, a model that brings whole campuses on board.</p>
```

- [ ] **Step 2: About interests**

Replace:

```html
                        Off the clock you'll find me rock climbing, hunting down LA's best coffee,
                        or deep in a beatboxing session.
```

with:

```html
                        Off the clock you'll find me at the racetrack, exploring a new city,
                        cooking for friends, or deep in a beatboxing session.
```

Replace the four `<li>` items in `about-interests` with:

```html
                        <li>🏇 Horse racing</li>
                        <li>🎤 Beatboxing</li>
                        <li>🌏 Exploring cultures</li>
                        <li>🍳 Cooking</li>
                        <li>🏃 Group running</li>
                        <li>🔢 2048</li>
```

- [ ] **Step 3: Timeline**

Replace the four `<li>` items in `about-timeline` with:

```html
                            <li><span>2026</span>Founded Kroot</li>
                            <li><span>2025</span>Product Manager @ Warner Bros. Discovery (HBO Max)</li>
                            <li><span>2024</span>Product @ Hearst · Wellx.ai · Snap Inc.</li>
                            <li><span>2023</span>President of ProductSC · Started Bizlang</li>
                            <li><span>2020</span>Founded FEMO</li>
```

- [ ] **Step 4: Contact email**

Replace every `kakeda@usc.edu` in `index.html` (the `mailto:` link, `data-email`, and the button label) with `takuto.kakeda@gmail.com`.

Run: `rg -n "kakeda@usc.edu|Elevait|Product Intern" index.html`
Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Bring homepage content in line with the current resume"
```

---

### Task 8: Final verification and push

- [ ] **Step 1: Automated checks**

Run: `node --test tests/ && for f in catalog.js premium.js race-day.js takuto-plus.js guestbook.js; do node --check "$f"; done`
Expected: all tests pass; no syntax output.

- [ ] **Step 2: Full manual pass**

At a desktop width and a 390px phone width, run the spec's manual checklist (items 1–8), including keyboard-only use (Tab, Enter, Space, Escape) through the picker, rows, title page, Race Day, and guestbook. Confirm the browser console shows no errors.

- [ ] **Step 3: Push**

```bash
git push origin main
```

Expected: Vercel deploys the new commit; repeat a quick check on the live site (pick a profile, run one race, see the ticker).
