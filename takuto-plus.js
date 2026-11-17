/* Takuto+: profile picker, personalized home, and the picks grid */
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
    const svg = (markup, className) => {
        const tpl = document.createElement("template");
        tpl.innerHTML = markup;
        const node = tpl.content.firstElementChild;
        if (className) node.setAttribute("class", className);
        node.setAttribute("aria-hidden", "true");
        return node;
    };

    const INK = "#1f2030";
    // Sticker for each polaroid, drawn in the same ink as the illustrations.
    const STICKERS = {
        recruiter: `<svg viewBox="0 0 48 48" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M15 3l9 14 9-14" stroke-width="2.6"/><rect x="11" y="16" width="26" height="29" rx="4" fill="#fff"/><rect x="19.5" y="13.5" width="9" height="5.5" rx="1.6" fill="#b7a6f5"/><circle cx="24" cy="27.5" r="4.6" fill="#cbbff2"/><path d="M17 37.5h14M19.5 41.5h9"/></svg>`,
        founder: `<svg viewBox="0 0 48 48" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><g transform="rotate(38 24 24)"><path d="M20.5 34.5c0 4.5 3.5 9 3.5 9s3.5-4.5 3.5-9z" fill="#f0c96b"/><path d="M17 25.5l-5.5 7 6.5.8zM31 25.5l5.5 7-6.5.8z" fill="#f08a72"/><path d="M24 4c6.5 5.2 8.5 12.6 8 20.5l-2.5 10h-11L16 24.5C15.5 16.6 17.5 9.2 24 4z" fill="#fff"/><circle cx="24" cy="18" r="3.6" fill="#8fb3ee"/></g></svg>`,
        student: `<svg viewBox="0 0 48 48" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 22.5v8.5c0 3 5.4 6 12 6s12-3 12-6v-8.5" fill="#3a3c52"/><path d="M3 18L24 8.5 45 18 24 27.5z" fill="#2a2b3d"/><path d="M38.5 21v11" stroke="#f0c96b" stroke-width="2.4"/><circle cx="38.5" cy="34" r="2.6" fill="#f0c96b"/></svg>`,
        explorer: `<svg viewBox="0 0 48 48" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M10 44c4-3.5 23-3.5 28 0" fill="#f3dc9b"/><path d="M24 21c1.6 7 .8 14.5-2.6 21" stroke="#8a5a3c" stroke-width="4"/><path d="M24 21c-4-6-11.5-7.2-17-4 6.3.2 11 1.6 17 4zM24 21c4-6 11.5-7.2 17-4-6.3.2-11 1.6-17 4zM24 21c-6.5-1.6-12.5 1.4-14.5 7 4.2-3.2 9.2-5.3 14.5-7zM24 21c6.5-1.6 12.5 1.4 14.5 7-4.2-3.2-9.2-5.3-14.5-7zM24 21c-2.4-6-1.4-12 3-15.5-1.4 5.2-1.4 10.4-3 15.5z" fill="#7cc576"/></svg>`,
    };
    const DOODLES = {
        tv: `<svg viewBox="0 0 64 58" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4l9 9.5L41 4"/><rect x="5" y="13.5" width="54" height="38" rx="9"/><rect x="11" y="19.5" width="35" height="26" rx="6"/><circle cx="22" cy="29.5" r="1.4" fill="currentColor"/><circle cx="35" cy="29.5" r="1.4" fill="currentColor"/><path d="M22.5 36c3.4 3 8.6 3 12 0"/><circle cx="52.5" cy="25" r="1.8"/><path d="M50 33h5M50 38h5M15 51.5l-3 5M49 51.5l3 5"/></svg>`,
        spark: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M8 20l9-12M17 26l15-6M15 35l11-1"/></svg>`,
        swoosh: `<svg viewBox="0 0 220 22" fill="none" preserveAspectRatio="none"><path d="M5 15C60 6 145 4 215 9" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`,
        arrow: `<svg viewBox="0 0 70 50" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M64 40C46 41 26 33 12 10"/><path d="M8 22L11 9l12 5"/></svg>`,
    };
    // Scene art is 1536×1024; the spine labels are placed on the drawn books.
    const SCENE = `<svg viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMax slice"><image href="images/whos-watching/scene.jpg" width="1536" height="1024"/><g class="tp-spines">${["PRODUCT", "STARTUPS", "MEDIA", "AI"].map((w, i) => `<text x="84" y="${[754, 818, 881, 945][i]}">${w}</text>`).join("")}</g></svg>`;
    const ICONS = {
        play: `<svg viewBox="0 0 16 16"><path d="M4.5 2.8v10.4L13 8 4.5 2.8Z" fill="currentColor"/></svg>`,
        swap: `<svg viewBox="0 0 16 16" fill="none"><path d="M4 6h9l-3-3M12 10H3l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
    const avatar = (id) => {
        const p = C.profiles[id];
        const a = el("span", "tp-avatar-sm");
        a.style.background = p.tint;
        const img = el("img");
        img.src = p.photo;
        img.alt = "";
        a.append(img);
        return a;
    };

    const storage = {
        get: () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } },
        set: (v) => { try { localStorage.setItem(STORAGE_KEY, v); } catch { /* private mode */ } },
        clear: () => { try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ } },
    };

    let profileId = null;

    const pad = (n) => String(n).padStart(2, "0");
    const raceNumber = (id) => {
        const i = C.profiles[profileId || "recruiter"].picks.indexOf(id);
        return pad(i + 1);
    };

    const openTitle = (id, trigger, { winner = false } = {}) => {
        const t = C.titles[id];
        if (!t || !window.TakutoOverlay) return;
        const p = C.profiles[profileId || "recruiter"];
        window.TakutoOverlay.open(
            {
                accent: p.accent,
                num: raceNumber(id),
                banner: winner ? `Winner's circle · ${t.horse.name}` : "",
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

    const silks = () => {
        const row = el("span", "tp-silks");
        for (const t of Object.values(C.titles)) {
            const dot = el("i");
            dot.style.background = t.accent;
            row.append(dot);
        }
        return row;
    };

    const art = (content, corner) => {
        const a = el("span", "tp-art");
        a.append(content);
        if (corner) a.append(corner);
        return a;
    };

    const liveCorner = (text) => {
        const c = el("span", "tp-art-corner");
        c.append(el("span", "tp-live-dot"), text);
        return c;
    };

    const metricLine = (stat) => {
        const m = el("span", "tp-card-metric");
        m.append(el("b", null, stat.value), ` ${stat.label}`);
        return m;
    };

    const renderCard = (id) => {
        const t = C.titles[id];
        const b = button("tp-card");
        b.setAttribute("aria-haspopup", "dialog");
        const body = el("span", "tp-card-body");
        const num = el("span", "tp-num tp-card-num", raceNumber(id));
        num.setAttribute("aria-hidden", "true");
        body.append(num, el("strong", "tp-card-name", t.name), el("span", "tp-card-role", `${t.role} · ${t.years}`), metricLine(t.stats[0]));
        b.append(art(el("span", "tp-wordmark", t.name)), body);
        b.addEventListener("click", () => openTitle(id, b));
        return b;
    };

    const renderRaceCard = () => {
        const b = button("tp-card");
        const body = el("span", "tp-card-body");
        const num = el("span", "tp-num tp-card-num", "R");
        num.setAttribute("aria-hidden", "true");
        body.append(num, el("strong", "tp-card-name", "Race Day"), el("span", "tp-card-role", "Pick a horse · 10 seconds"), el("span", "tp-card-metric", "Six projects, one track"));
        b.append(art(silks(), liveCorner("Live event")), body);
        b.addEventListener("click", showRace);
        return b;
    };

    const renderStats = (stats) => {
        const dl = el("dl", "tp-stats");
        for (const s of stats) {
            const item = el("div");
            item.append(el("dt", "tp-num", s.value), el("dd", null, s.label));
            dl.append(item);
        }
        return dl;
    };

    const renderFeature = (p) => {
        const isRace = p.featured === "race";
        const t = isRace ? null : C.titles[p.featured];
        const feature = el("div", "tp-feature");

        const meta = el("p", "tp-feature-meta");
        meta.append(
            el("span", "tp-num", isRace ? "Live" : `No. ${raceNumber(p.featured)}`),
            el("span", "tp-kicker", isRace ? "Today's event" : `Featured · ${t.role}`)
        );

        const play = button("btn btn-primary");
        play.append(svg(ICONS.play), isRace ? "Go to the track" : "View the work");
        if (isRace) {
            play.addEventListener("click", showRace);
        } else {
            play.setAttribute("aria-haspopup", "dialog");
            play.setAttribute("aria-label", `View the work: ${t.name}`);
            play.addEventListener("click", () => openTitle(p.featured, play));
        }
        const actions = el("div", "tp-feature-actions");
        actions.append(play, el("span", "tp-feature-note", isRace ? "Your pick always wins" : `${t.org} · ${t.dates}`));

        const body = el("div", "tp-feature-body");
        body.append(
            meta,
            el("h3", "tp-feature-title", isRace ? "Race Day" : t.name),
            el("p", "tp-feature-pitch", isRace ? C.race.pitch : t.pitch),
            renderStats(isRace ? C.race.stats : t.stats),
            actions
        );
        const visual = isRace
            ? art(silks(), liveCorner("Live event"))
            : art(el("span", "tp-wordmark", t.name), el("span", "tp-art-corner", t.tags.slice(0, 2).join(" · ")));
        visual.classList.add("tp-art-feature");
        feature.append(body, visual);
        return { feature, play };
    };

    const renderHome = (id, { focus = false } = {}) => {
        const p = C.profiles[id];
        profileId = id;
        app.style.setProperty("--pc", p.accent);

        const who = el("p", "tp-bar-who");
        who.append(avatar(id), `Watching as ${p.label}`);
        const sw = button("tp-link");
        sw.append("Switch profile", svg(ICONS.swap));
        sw.addEventListener("click", () => {
            storage.clear();
            profileId = null;
            renderPicker({ focus: true });
        });
        const bar = el("div", "tp-bar");
        bar.append(who, sw);

        const { feature, play } = renderFeature(p);

        const picks = p.picks.filter((t) => t !== p.featured);
        const grid = el("div", "tp-grid");
        grid.append(...picks.map(renderCard));
        if (p.featured !== "race") grid.append(renderRaceCard());
        const head = el("div", "tp-grid-head");
        head.append(el("h3", "tp-grid-title", p.picksTitle), el("span", "tp-kicker", `${grid.children.length} titles`));
        const section = el("section", "tp-picks");
        section.setAttribute("aria-label", p.picksTitle);
        section.append(head, grid);

        app.replaceChildren(bar, feature, section);
        if (focus) play.focus({ preventScroll: true });
    };

    const choose = (id) => {
        storage.set(id);
        if (reduceMotion) return renderHome(id, { focus: true });
        const loader = el("div", "tp-loader");
        loader.style.setProperty("--pc", C.profiles[id].accent);
        loader.setAttribute("role", "status");
        loader.append(el("span", "tp-loader-ring"), el("span", null, `Loading ${C.profiles[id].label}…`));
        app.replaceChildren(loader);
        setTimeout(() => renderHome(id, { focus: true }), LOADER_MS);
    };

    const renderPolaroid = (id, p) => {
        const b = button("tp-polaroid");
        b.style.setProperty("--pc", p.accent);
        b.style.setProperty("--tint", p.tint);
        const photo = el("span", "tp-photo");
        const img = el("img");
        img.src = p.photo;
        img.alt = "";
        img.width = 640;
        img.height = 640;
        photo.append(img, svg(STICKERS[id], "tp-sticker"));
        b.append(photo, el("span", "tp-polaroid-label", p.label), el("span", "tp-polaroid-blurb", p.blurb));
        b.addEventListener("click", () => choose(id));
        return b;
    };

    const renderPicker = ({ focus = false } = {}) => {
        app.style.removeProperty("--pc");
        const grid = el("div", "tp-profiles");
        for (const [id, p] of Object.entries(C.profiles)) grid.append(renderPolaroid(id, p));

        const script = el("span", "tp-script", "watching?");
        script.append(svg(DOODLES.swoosh, "tp-swoosh"));
        const title = el("h2", "tp-picker-title");
        title.append(svg(DOODLES.tv, "tp-doodle-tv"), "Who's ", script, svg(DOODLES.spark, "tp-doodle-spark"));

        const hint = el("p", "tp-picker-hint");
        hint.append(svg(DOODLES.arrow, "tp-doodle-arrow"), "Pick a profile and I'll line up the work that matters to ", el("span", "tp-you", "you"), ".");

        const inner = el("div", "tp-stage-inner");
        inner.append(el("p", "tp-kicker tp-stage-kicker", "Takuto Kakeda · Product manager & founder · Los Angeles"), title, grid, hint);
        const wrap = el("div", "tp-picker tp-stage");
        wrap.append(svg(SCENE, "tp-scene"), inner);
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
