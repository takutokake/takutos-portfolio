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

    // Drawn marks, one per profile. Same stroke, same size, no emoji.
    const MARKS = {
        recruiter: `<svg viewBox="0 0 32 32" fill="none"><path d="M6.5 10h8.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M18.2 10.4 20 12.2l4-4.2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 16h19M6.5 22h19" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
        founder: `<svg viewBox="0 0 32 32" fill="none"><circle cx="11" cy="16.5" r="5.25" stroke="currentColor" stroke-width="1.75"/><path d="M19.4 12.2 22 9.8v12.7M19.2 22.5h5.6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        community: `<svg viewBox="0 0 32 32" fill="none"><path d="M5 23.5c1.6-7 5.6-10.8 11-10.8s9.4 3.8 11 10.8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="9.2" cy="12.2" r="1.7" fill="currentColor"/><circle cx="16" cy="9" r="1.95" fill="currentColor"/><circle cx="22.8" cy="12.2" r="1.7" fill="currentColor"/></svg>`,
        curious: `<svg viewBox="0 0 32 32" fill="none"><path d="M7.5 12.5h17v2.15a2.15 2.15 0 0 0 0 4.2V21h-17v-2.15a2.15 2.15 0 0 0 0-4.2v-2.15Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M16 14.2v4.2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-dasharray="1.1 1.7"/></svg>`,
    };
    const ICONS = {
        play: `<svg viewBox="0 0 16 16"><path d="M4.5 2.8v10.4L13 8 4.5 2.8Z" fill="currentColor"/></svg>`,
        swap: `<svg viewBox="0 0 16 16" fill="none"><path d="M4 6h9l-3-3M12 10H3l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
    const avatar = (id, className = "tp-avatar") => {
        const a = el("span", className);
        a.style.setProperty("--pc", C.profiles[id].accent);
        a.append(svg(MARKS[id]));
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
        who.append(avatar(id, "tp-avatar tp-avatar-sm"), `Watching as ${p.label}`);
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

    const renderPicker = ({ focus = false } = {}) => {
        app.style.removeProperty("--pc");
        const grid = el("div", "tp-profiles");
        for (const [id, p] of Object.entries(C.profiles)) {
            const b = button("tp-profile");
            b.style.setProperty("--pc", p.accent);
            b.append(avatar(id), el("span", "tp-profile-label", p.label), el("span", "tp-profile-blurb", p.blurb));
            b.addEventListener("click", () => choose(id));
            grid.append(b);
        }
        const title = el("h3", "tp-picker-title", "Who's ");
        title.append(el("span", "accent-serif", "watching"), "?");
        const wrap = el("div", "tp-picker");
        wrap.append(title, grid);
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
