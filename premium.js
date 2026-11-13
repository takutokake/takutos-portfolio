/* Takuto Kakeda — premium portfolio interactions */
(() => {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

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
