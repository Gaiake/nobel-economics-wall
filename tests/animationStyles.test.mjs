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
    "height: 1920px",
    ".nav-panel",
    ".middle-panel",
    ".market-panel",
    ".market-frame",
    "overflow: hidden",
    ".interactive-module",
    "--cyan",
    "--title-font",
    ".nav-intro",
    "grid-template-rows: repeat(3, minmax(0, 1fr))",
    ".nobel-footer",
    ".nobel-two-screen",
    ".nobel-detail-stage",
    ".nobel-picker",
    "grid-template-columns: 1fr 1fr",
    "grid-template-columns: repeat(3, minmax(0, 1fr))",
    "width: 230px",
    "width: 118px",
    "aspect-ratio: 1 / 0.86",
    ".interactive-actions",
    ".game-screen-split",
    "grid-template-columns: 1fr 1fr",
    ".interactive-rail",
    ".game-display-panel",
    ".embed-stage.is-compact",
    ".embed-stage.is-portrait-fill",
    ".embed-frame-wrap",
    "aspect-ratio: 9 / 16",
    "height: min(100%, 1720px)",
    "width: 430px",
    "transform: scale(2.42)",
    "width: auto",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
  assert.ok(app.includes('<span>浙江大学</span>'), "base title should put Zhejiang University on its own line");
  assert.ok(app.includes('<span>学科思政育人示范基地</span>'), "base title should put base name on its own line");
  assert.ok(app.includes("打造沉浸式经济学科普阵地"), "nav intro should include the base introduction");
  assert.ok(app.includes("<h2>科普互动游戏</h2>"), "game module should use the navigation display title");
  assert.ok(app.includes("支持单位：上海证券交易所、中国证券博物馆"), "game module should show support units");
  assert.ok(app.includes("<h2>科普电子书橱</h2>"), "bookcase module should use the navigation display title");
  assert.ok(app.indexOf("nobel-picker") < app.indexOf("nobel-detail-stage"), "Nobel picker should render on the second screen before detail on the third screen");
  assert.ok(app.includes("支持单位：上海期货交易所"), "bookcase module should show support unit");
  assert.equal(app.includes("模块一"), false, "game module should not show internal module numbering");
  assert.equal(app.includes("模块三"), false, "bookcase module should not show internal module numbering");
  assert.equal(app.includes("上交所投教小游戏"), false, "old game module title should be removed");
  assert.ok(css.includes("font-family: var(--title-font)"), "nav title should use the display title font stack");
  assert.ok(css.includes(".interactive-header .interactive-support"), "support unit line should have explicit styling");
  assert.equal(app.includes("浙江大学经济学院"), false, "old college label should be removed from nav brand");
  assert.equal(app.includes("执善向上 · 经世济民"), false, "old motto should be removed from nav brand");
  assert.equal(app.includes("APP_DISPLAY"), false, "navigation should not show app dimensions");
  assert.equal(app.includes("market-news"), false, "market news should not be part of the app navigation");
  assert.ok(app.includes("TONGHUASHUN_MARKET_URL"), "right three screens should embed the Tonghuashun market panel");
  assert.equal(app.includes("market-header"), false, "market panel should not add a chrome header over the three-screen embed");
  assert.equal(app.includes("market-open-link"), false, "market panel should not overlay controls on the three-screen embed");
  assert.equal(app.includes("新窗口打开"), false, "embedded modules should not overlay a new-window button");
  assert.ok(css.includes("display: none"), "embedded module toolbar should be hidden from the game canvas");
  assert.equal(css.includes(".market-frame-shell"), false, "market iframe should occupy the full three-screen region");
  assert.ok(css.includes(".bookcase-module > .embed-stage"), "bookcase embed should fill the module");
  assert.ok(css.includes("--cyan: #8cc8df"), "left panels should use the muted Tonghuashun-compatible cyan");
  assert.ok(css.includes("linear-gradient(135deg, #020407 0%, #06101a 48%, #020509 100%)"), "left wall background should use a black-blue finance palette");
  assert.equal(css.includes("#29dcff"), false, "old saturated cyan should not return");
  assert.equal(css.includes("#0a2d63"), false, "old bright blue wall background should not return");
});

test("single-display debug styles preserve the full six-panel wall preview", () => {
  for (const token of [
    "@media (max-width: 1200px)",
    "width: 6480px",
    "height: 1920px",
    ".screen-shell::after",
    "单屏调试：横向滚动查看六屏",
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});
