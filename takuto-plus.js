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
    const logo = (t, alt = `${t.name} logo`) => {
        const img = el("img");
        img.src = t.logo;
        img.alt = alt;
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
        art.append(logo(t, ""));
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
            play.setAttribute("aria-label", `Play ${t.name}`);
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
