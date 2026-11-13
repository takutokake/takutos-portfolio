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
