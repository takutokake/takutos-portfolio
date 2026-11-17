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
        assert.ok(t.years, `${id}.years`);
        assert.ok(t.stats.length >= 2 && t.stats.length <= 3, `${id} has 2–3 stats`);
        for (const s of t.stats) assert.ok(s.value && s.label, `${id} stat`);
        assert.ok(t.logoWidth > 0 && t.logoWidth <= 80, `${id}.logoWidth`);
        assert.ok(fs.existsSync(path.join(__dirname, "..", t.logo)), `${t.logo} exists`);
    }
});

test("profiles list every title once, featured first", () => {
    assert.deepEqual(Object.keys(C.profiles), ["recruiter", "founder", "student", "explorer"]);
    for (const [pid, p] of Object.entries(C.profiles)) {
        assert.ok(p.label && p.blurb && p.accent && p.tint && p.picksTitle, `${pid} display fields`);
        assert.ok(fs.existsSync(path.join(__dirname, "..", p.photo)), `${p.photo} exists`);
        assert.ok(p.featured === "race" || TITLE_IDS.includes(p.featured), `${pid}.featured`);
        assert.deepEqual([...p.picks].sort(), [...TITLE_IDS].sort(), `${pid} shows each title once`);
        if (p.featured !== "race") assert.equal(p.picks[0], p.featured, `${pid} featured is pick 1`);
    }
});

test("accents are hex colors and profiles share none", () => {
    const hex = /^#[0-9a-f]{6}$/;
    const profileAccents = Object.values(C.profiles).map((p) => p.accent);
    for (const a of profileAccents) assert.match(a, hex);
    for (const p of Object.values(C.profiles)) assert.match(p.tint, hex);
    assert.equal(new Set(profileAccents).size, profileAccents.length);
    for (const t of Object.values(C.titles)) assert.match(t.accent, hex);
});

test("featured banners match the spec", () => {
    assert.equal(C.profiles.recruiter.featured, "hbo");
    assert.equal(C.profiles.founder.featured, "kroot");
    assert.equal(C.profiles.student.featured, "productsc");
    assert.equal(C.profiles.explorer.featured, "race");
});

test("race copy credits Snap and sample reviews exist", () => {
    assert.ok(C.race.intro.includes("Snap"));
    assert.ok(C.race.accent && C.race.pitch);
    assert.ok(C.race.stats.length === 3);
    assert.ok(C.sampleReviews.length >= 3);
});
