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

test("shell styles reserve the six-screen 1:2:3 wall region", () => {
  for (const token of [
    ".screen-shell",
    "grid-template-columns: 1fr 2fr 3fr",
    "width: max(100vw, 6480px)",
    ".nav-panel",
    ".middle-panel",
    ".market-panel",
    ".market-frame",
    "overflow: hidden",
    ".interactive-module",
    "--cyan",
    "--title-font",
    ".nav-intro",
    ".nobel-footer",
    ".interactive-actions",
    ".game-screen-split",
    "grid-template-columns: 1fr 1fr",
    ".interactive-rail",
    ".game-display-panel",
    ".embed-stage.is-compact",
    ".embed-frame-wrap",
    "aspect-ratio: 9 / 16",
    "height: min(100%, 1720px)",
    "width: auto",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
  assert.ok(app.includes('<span>浙江大学</span>'), "base title should put Zhejiang University on its own line");
  assert.ok(app.includes('<span>学科思政育人示范基地</span>'), "base title should put base name on its own line");
  assert.ok(app.includes("打造沉浸式经济学科普阵地"), "nav intro should include the base introduction");
  assert.ok(css.includes("font-family: var(--title-font)"), "nav title should use the display title font stack");
  assert.equal(app.includes("浙江大学经济学院"), false, "old college label should be removed from nav brand");
  assert.equal(app.includes("执善向上 · 经世济民"), false, "old motto should be removed from nav brand");
  assert.equal(app.includes("APP_DISPLAY"), false, "navigation should not show app dimensions");
  assert.equal(app.includes("market-news"), false, "market news should not be part of the app navigation");
  assert.ok(app.includes("TONGHUASHUN_MARKET_URL"), "right three screens should embed the Tonghuashun market panel");
  assert.ok(css.includes(".bookcase-module > .embed-stage"), "bookcase embed should fill the module");
});

test("single-display debug styles preserve the full six-panel wall preview", () => {
  for (const token of [
    "@media (max-width: 1200px)",
    "width: 6480px",
    ".screen-shell::after",
    "单屏调试：横向滚动查看六屏",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});
