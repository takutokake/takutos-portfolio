/* Takuto Kakeda — premium portfolio interactions */
(() => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    /* ---------- project data ---------- */
    const PROJECTS = {
        wbd: {
            kicker: "Product Intern · Warner Bros. Discovery · 2025",
            title: "Personalization at HBO Max",
            tags: ["Recommendations", "Experimentation", "Streaming"],
            desc:
                "At Warner Bros. Discovery I worked on HBO Max personalization — contributing to the design and analysis of a Teen Users rails algorithm and supporting experiments that sharpen content recommendations.\n\nThe work spanned data analysis, experiment design, and cross-functional collaboration with engineering and data science, with features now rolling out to improve recommendation accuracy at scale.",
            stats: [
                { n: "12M+", l: "users reached by shipped features" },
                { n: "15%", l: "improvement in user engagement" },
                { n: "1", l: "rails algorithm shaped end-to-end" },
            ],
        },
        elevait: {
            kicker: "Founder · Elevait · Now building",
            title: "Elevait — discover what's next",
            tags: ["AI", "0 → 1", "Career discovery"],
            desc:
                "Elevait is my current 0-to-1 project: an early-stage AI product built around this site's thesis — helping people discover and act on their next opportunity.\n\nRight now that means staying close to users, prototyping fast in Figma and code, and shipping weekly. More to share soon — if this space interests you, I'd love to talk.",
            stats: [
                { n: "0 → 1", l: "currently in build mode" },
                { n: "Weekly", l: "shipping cadence" },
                { n: "AI-first", l: "product architecture" },
            ],
        },
        productsc: {
            kicker: "President · ProductSC · USC",
            title: "Rebuilding USC's product community",
            tags: ["Community", "Curriculum design", "Leadership"],
            desc:
                "As President of ProductSC, USC's product management organization, I revitalized the club around three original curricula: Compass (PM fundamentals), Catalyst (advanced skills), and a Client Program pairing students with real companies.\n\nBeyond the curriculum, I built partnerships across schools and companies and turned ProductSC into a launchpad — helping hundreds of students explore product and land their first PM roles.",
            stats: [
                { n: "40×", l: "membership growth" },
                { n: "50+", l: "students placed in PM internships" },
                { n: "10+", l: "company partnerships" },
            ],
        },
        femo: {
            kicker: "Founder · FEMO · Nonprofit",
            title: "Foreign English Mentorship Organization",
            tags: ["Mentorship", "Cross-cultural", "Nonprofit"],
            desc:
                "I founded FEMO to connect international students with English-speaking mentors — a structured mentorship program built around cross-cultural exchange, language growth, and genuine community.\n\nThe hardest problems were human ones: mentor quality, keeping the personal touch while scaling, and measuring something as soft as confidence. The results made it worth it.",
            stats: [
                { n: "100+", l: "mentor–mentee pairs" },
                { n: "85%", l: "report improved confidence" },
                { n: "1", l: "community across two cultures" },
            ],
        },
    };

    /* ---------- hero word stagger ---------- */
    $$(".hero-title .line").forEach((line) => {
        $$(".w", line).forEach((w, i) => w.style.setProperty("--i", i));
    });

    /* ---------- reveal on scroll ---------- */
    const revealIO = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    e.target.classList.add("in");
                    revealIO.unobserve(e.target);
                }
            }
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    $$(".reveal").forEach((el) => revealIO.observe(el));

    /* ---------- nav: scrolled state + active section ---------- */
    const navWrap = $("#nav");
    const navLinks = $$("#nav-links a");
    const sections = navLinks
        .map((a) => document.getElementById(a.dataset.section))
        .filter(Boolean);

    const sectionIO = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (!e.isIntersecting) continue;
                navLinks.forEach((a) =>
                    a.classList.toggle("active", a.dataset.section === e.target.id)
                );
            }
        },
        { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => sectionIO.observe(s));

    /* ---------- scroll-driven effects (rAF batched) ---------- */
    const progressBar = $("#scroll-progress-bar");
    const railFill = $("#story-rail-fill");
    const story = $("#story");
    const parallaxEls = $$("[data-parallax]").map((el) => ({
        el,
        speed: parseFloat(el.dataset.parallax) || 0.2,
    }));

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;

            if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
            navWrap.classList.toggle("scrolled", y > 24);

            if (railFill && story) {
                const r = story.getBoundingClientRect();
                const total = r.height - window.innerHeight;
                const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
                railFill.style.transform = `scaleY(${p})`;
            }

            if (!reduceMotion) {
                for (const { el, speed } of parallaxEls) {
                    const r = el.getBoundingClientRect();
                    const mid = r.top + r.height / 2 - window.innerHeight / 2;
                    el.style.transform = `translate3d(0, ${(-mid * speed).toFixed(1)}px, 0)`;
                }
            }
            ticking = false;
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- spotlight cards ---------- */
    $$(".spotlight").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${e.clientX - r.left}px`);
            card.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
    });

    /* ---------- magnetic buttons ---------- */
    if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
        $$(".magnetic").forEach((btn) => {
            btn.addEventListener("pointermove", (e) => {
                const r = btn.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
            });
            btn.addEventListener("pointerleave", () => {
                btn.style.transform = "";
            });
        });
    }

    /* ---------- expanding project overlay (FLIP) ---------- */
    const overlay = $("#project-overlay");
    const overlayCard = $("#project-overlay-card");
    let lastTrigger = null;

    const fillOverlay = (id, accent) => {
        const p = PROJECTS[id];
        if (!p) return false;
        overlayCard.style.setProperty("--pc", accent);
        $("#overlay-band").style.setProperty("--pc", accent);
        $("#overlay-kicker").textContent = p.kicker;
        $("#overlay-title").textContent = p.title;
        $("#overlay-desc").textContent = p.desc;
        $("#overlay-tags").innerHTML = p.tags
            .map((t) => `<span class="tag">${t}</span>`)
            .join("");
        $("#overlay-stats").innerHTML = p.stats
            .map(
                (s) =>
                    `<div class="overlay-stat"><strong>${s.n}</strong><span>${s.l}</span></div>`
            )
            .join("");
        return true;
    };

    const openProject = (card) => {
        const accent = getComputedStyle(card).getPropertyValue("--pc").trim() || "#8b7cf7";
        if (!fillOverlay(card.dataset.project, accent)) return;

        lastTrigger = card;
        overlay.hidden = false;
        document.body.classList.add("no-scroll");

        // FLIP: animate from the clicked card's rect to the dialog's rect
        requestAnimationFrame(() => {
            overlay.classList.add("open");
            if (!reduceMotion && overlayCard.animate) {
                const from = card.getBoundingClientRect();
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

    const closeProject = () => {
        const finish = () => {
            overlay.classList.remove("open");
            overlay.hidden = true;
            document.body.classList.remove("no-scroll");
            if (lastTrigger) lastTrigger.focus({ preventScroll: true });
        };
        if (!reduceMotion && overlayCard.animate && lastTrigger) {
            const to = lastTrigger.getBoundingClientRect();
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

    $$(".work-card").forEach((card) =>
        card.addEventListener("click", () => openProject(card))
    );
    $$("[data-close]", overlay).forEach((el) =>
        el.addEventListener("click", closeProject)
    );
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlay.hidden) closeProject();
    });

    /* ---------- copy email ---------- */
    const copyBtn = $("#copy-email");
    if (copyBtn) {
        const label = $("#copy-email-label");
        const original = label.textContent;
        copyBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(copyBtn.dataset.email);
                label.textContent = "Copied ✓";
            } catch {
                label.textContent = copyBtn.dataset.email;
            }
            setTimeout(() => (label.textContent = original), 1800);
        });
    }

    /* ---------- footer year ---------- */
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
})();
