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
