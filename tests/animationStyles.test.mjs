import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

test("motion styles define restrained gallery and detail animations", () => {
  for (const token of [
    "@keyframes detail-reveal",
    "@keyframes background-drift",
    "@media (prefers-reduced-motion: reduce)",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});

test("selected cards do not use flashing infinite highlight animations", () => {
  assert.equal(css.includes("@keyframes active-glow"), false);
  assert.equal(css.includes("active-glow"), false);
  assert.equal(/\\.laureate-card\\.is-active[\\s\\S]*infinite/.test(css), false);
});

test("person switching does not reanimate the whole card grid", () => {
  assert.equal(css.includes("@keyframes card-enter"), false);
  assert.equal(app.includes("animation-delay"), false);
});
