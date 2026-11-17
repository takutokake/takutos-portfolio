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

    const RACE_MS = 10000;
    const HORSE_PX = 30;
    const BACK_ICON = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3m4-4L3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
        let winnerTimer = null;

        const wrap = el("div", "race");
        const back = button("tp-link");
        const tpl = document.createElement("template");
        tpl.innerHTML = BACK_ICON;
        back.append(tpl.content, "Back to home");
        back.addEventListener("click", onBack);
        const live = el("p", "race-live");
        live.append(el("span", "tp-live-dot"), "Live · Today's card");
        const head = el("div", "race-head");
        head.append(live, back);

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
            const horse = el("span", "race-horse", String(i + 1));
            horse.setAttribute("aria-hidden", "true");
            const run = el("div", "race-run");
            run.setAttribute("aria-hidden", "true");
            run.append(horse);
            lane.append(pick, run);
            return { id, lane, pick, place, horse };
        });
        const track = el("div", "race-track");
        track.append(...lanes.map((l) => l.lane));

        const finish = (plan) => {
            if (!wrap.isConnected) return;
            plan.order.forEach((id, i) => {
                const l = lanes.find((x) => x.id === id);
                l.horse.getAnimations?.().forEach((a) => a.cancel());
                l.horse.style.left = position(plan.frames[id][plan.frames[id].length - 1]);
                l.place.textContent = PLACES[i];
            });
            const winner = lanes.find((l) => l.id === plan.order[0]);
            winner.lane.classList.add("is-winner");
            const t = C.titles[winner.id];
            status.textContent = `${t.horse.name} wins! Here's the ${t.name} story.`;
            again.hidden = false;
            winnerTimer = setTimeout(() => {
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
            clearTimeout(winnerTimer);
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

        const title = el("h3", "race-title", "Race ");
        title.append(el("span", "accent-serif", "Day"));
        const cols = el("div", "race-cols");
        cols.setAttribute("aria-hidden", "true");
        cols.append(el("span", null, "No. · Entry"), el("span", null, "Finish"));
        track.prepend(cols);
        wrap.append(head, title, el("p", "race-intro", C.race.intro), prompt, track, status, again);
        container.append(wrap);
        lanes[0].pick.focus({ preventScroll: true });
    };

    window.TakutoRace = { planRace, mount };
})();
