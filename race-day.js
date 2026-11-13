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
