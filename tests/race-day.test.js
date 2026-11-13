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
