import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

test("motion styles define restrained gallery and detail animations", () => {
  for (const token of [
    "@keyframes detail-reveal",
    "@keyframes background-drift",
    "@keyframes ambient-sweep",
    "@media (prefers-reduced-motion: reduce)",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});

test("ambient motion lives in the empty background layer", () => {
  assert.ok(css.includes("body::before"), "background sweep should be a body pseudo-element");
  assert.ok(css.includes("pointer-events: none"), "background sweep should not intercept touches");
  assert.ok(css.includes("mix-blend-mode: screen"), "background sweep should stay luminous and subtle");
});

test("background has floating particles and keyword texture layers", () => {
  for (const token of [
    ".app-shell::before",
    ".app-shell::after",
    "@keyframes particle-float",
    "@keyframes keyword-float",
    "增长 · 制度 · 市场 · 福利 · 计量 · 创新",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});

test("exhibition polish tokens and surfaces are present", () => {
  for (const token of [
    "--panel-deep",
    "--paper-edge",
    "--museum-shadow",
    "body::after",
    ".laureate-card::before",
    ".detail-panel::before",
    "blockquote::before",
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

test("shell styles reserve the left three-screen 1:2 app region", () => {
  for (const token of [
    ".screen-shell",
    "grid-template-columns: 1fr 2fr",
    ".nav-panel",
    ".middle-panel",
    "overflow: hidden",
    ".interactive-module",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
  assert.ok(app.includes("执善向上 · 经世济民"), "missing college motto text");
  assert.equal(app.includes("APP_DISPLAY"), false, "navigation should not show app dimensions");
  assert.equal(app.includes("market-news"), false, "market news should not be part of the app navigation");
  assert.ok(css.includes(".bookcase-module > .embed-stage"), "bookcase embed should fill the module");
});

test("single-display debug styles show only the left three panels", () => {
  for (const token of [
    "@media (max-width: 1200px)",
    "grid-template-columns: 1fr 2fr",
    ".screen-shell::after",
    "单屏调试",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});
