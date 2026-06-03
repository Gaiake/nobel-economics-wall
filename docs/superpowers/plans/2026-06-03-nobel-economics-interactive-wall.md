# Nobel Economics Interactive Wall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone local web module for a touch-wall Nobel economics laureate gallery covering 1969-2025.

**Architecture:** Use a static browser app that loads local JSON data and portrait assets. Keep parsing, state logic, rendering, and styles separate so data extraction can be tested without the UI and the UI can run offline on the display server.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Node.js built-in test runner, Python standard library for `.docx` XML/media extraction.

---

## File Structure

- Create `index.html`: App shell and module entry.
- Create `src/styles.css`: Full-screen wide touch-wall layout, responsive fallbacks, active states, and missing-data presentation.
- Create `src/app.js`: Browser wiring, data fetch, render functions, interaction handlers, and auto-advance timer.
- Create `src/laureateState.js`: Pure state helpers for decades, active laureate selection, navigation, and auto-advance.
- Create `src/data/laureates.json`: Generated structured local data used by the app.
- Create `scripts/extract_laureates.py`: Extract Word document text/media and generate `src/data/laureates.json` plus portrait assets.
- Create `assets/portraits/.gitkeep`: Keeps the portrait folder in source control before generated portraits exist.
- Create `tests/laureateState.test.mjs`: Unit tests for state helpers.
- Create `tests/dataShape.test.mjs`: Unit tests for generated JSON shape and required coverage.
- Modify `docs/superpowers/specs/2026-06-03-nobel-economics-interactive-wall-design.md` only if implementation uncovers a necessary spec correction.

## Task 1: Initialize Static App Skeleton

**Files:**
- Create: `index.html`
- Create: `src/styles.css`
- Create: `src/app.js`
- Create: `src/laureateState.js`
- Create: `assets/portraits/.gitkeep`

- [ ] **Step 1: Create the app shell**

Create `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>诺贝尔经济学奖得主 | 浙江大学经济学院</title>
    <link rel="stylesheet" href="src/styles.css">
  </head>
  <body>
    <main id="app" class="app-shell" aria-live="polite">
      <section class="loading-state">
        <p>正在载入诺贝尔经济学奖得主资料...</p>
      </section>
    </main>
    <script type="module" src="src/app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create initial styles**

Create `src/styles.css` with a minimal non-overlapping shell:

```css
:root {
  color-scheme: dark;
  --bg: #101918;
  --panel: #f6efdf;
  --ink: #14211f;
  --muted: #6f786f;
  --gold: #d2a84d;
  --gold-dark: #8b6b22;
  --green: #203833;
  --blue: #536f86;
  --brick: #9b5d4b;
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--panel);
}

button {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: clamp(20px, 2vw, 42px);
}

.loading-state,
.error-state {
  min-height: 70vh;
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 28px;
}
```

- [ ] **Step 3: Create placeholder JavaScript entry**

Create `src/app.js` with:

```js
const app = document.querySelector("#app");

app.innerHTML = `
  <section class="error-state">
    <p>页面结构已创建，等待载入数据。</p>
  </section>
`;
```

- [ ] **Step 4: Create state helper module**

Create `src/laureateState.js` with:

```js
export function getDecades(laureates) {
  return [...new Set(laureates.map((item) => item.decade))];
}
```

- [ ] **Step 5: Create portrait folder marker**

Create an empty file at `assets/portraits/.gitkeep`.

- [ ] **Step 6: Smoke test the static shell**

Run:

```bash
python3 -m http.server 8080
```

Expected: opening `http://localhost:8080` shows `页面结构已创建，等待载入数据。`

## Task 2: Add State Helper Tests And Implementation

**Files:**
- Create: `tests/laureateState.test.mjs`
- Modify: `src/laureateState.js`

- [ ] **Step 1: Write state tests**

Create `tests/laureateState.test.mjs` with:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  getDecades,
  getLaureatesForDecade,
  getInitialSelection,
  getNextLaureate,
} from "../src/laureateState.js";

const sample = [
  { id: "frisch-1969", nameZh: "拉格纳·弗里希", decade: "1969-1979", year: 1969 },
  { id: "samuelson-1970", nameZh: "保罗·萨缪尔森", decade: "1969-1979", year: 1970 },
  { id: "sen-1998", nameZh: "阿马蒂亚·森", decade: "1990s", year: 1998 },
];

test("getDecades preserves first-seen decade order", () => {
  assert.deepEqual(getDecades(sample), ["1969-1979", "1990s"]);
});

test("getLaureatesForDecade returns records for one decade", () => {
  assert.deepEqual(
    getLaureatesForDecade(sample, "1969-1979").map((item) => item.id),
    ["frisch-1969", "samuelson-1970"],
  );
});

test("getInitialSelection chooses first decade and first laureate", () => {
  assert.deepEqual(getInitialSelection(sample), {
    activeDecade: "1969-1979",
    activeLaureateId: "frisch-1969",
  });
});

test("getNextLaureate advances within the full data set", () => {
  assert.equal(getNextLaureate(sample, "frisch-1969").id, "samuelson-1970");
  assert.equal(getNextLaureate(sample, "sen-1998").id, "frisch-1969");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/laureateState.test.mjs
```

Expected: FAIL because `getLaureatesForDecade`, `getInitialSelection`, and `getNextLaureate` are not exported yet.

- [ ] **Step 3: Implement state helpers**

Replace `src/laureateState.js` with:

```js
export function getDecades(laureates) {
  return [...new Set(laureates.map((item) => item.decade))];
}

export function getLaureatesForDecade(laureates, decade) {
  return laureates.filter((item) => item.decade === decade);
}

export function getInitialSelection(laureates) {
  const [activeDecade] = getDecades(laureates);
  const [firstLaureate] = getLaureatesForDecade(laureates, activeDecade);

  return {
    activeDecade,
    activeLaureateId: firstLaureate?.id ?? "",
  };
}

export function getNextLaureate(laureates, activeLaureateId) {
  if (laureates.length === 0) {
    return null;
  }

  const activeIndex = laureates.findIndex((item) => item.id === activeLaureateId);
  const nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % laureates.length;
  return laureates[nextIndex];
}
```

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/laureateState.test.mjs
```

Expected: PASS for all four tests.

## Task 3: Extract Data From Word Document

**Files:**
- Create: `scripts/extract_laureates.py`
- Create: `src/data/laureates.json`
- Modify: `assets/portraits/`

- [ ] **Step 1: Create the extractor**

Create `scripts/extract_laureates.py` with:

```python
from __future__ import annotations

import json
import re
import shutil
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX_PATH = ROOT / "1969-2025年诺贝尔经济学奖得主.docx"
DATA_PATH = ROOT / "src" / "data" / "laureates.json"
PORTRAIT_DIR = ROOT / "assets" / "portraits"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
YEAR_RE = re.compile(r"^(19|20)\d{2}年$")
WINNER_LINE_RE = re.compile(r"^(.+?)（(.+?)，(.+?)）$")


def decade_for_year(year: int) -> str:
    if 1969 <= year <= 1979:
        return "1969-1979"
    return f"{year // 10 * 10}s"


def slugify_name(name_en: str, year: int, index: int) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name_en.lower()).strip("-")
    return f"{base or 'laureate'}-{year}-{index}"


def read_paragraphs() -> list[str]:
    with zipfile.ZipFile(DOCX_PATH) as archive:
      document_xml = archive.read("word/document.xml")

    root = ET.fromstring(document_xml)
    paragraphs = []
    for paragraph in root.findall(".//w:p", NS):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def split_sections(paragraphs: list[str]) -> list[tuple[int, list[str]]]:
    sections = []
    current_year = None
    current_lines = []

    for paragraph in paragraphs:
        if YEAR_RE.match(paragraph):
            if current_year is not None:
                sections.append((current_year, current_lines))
            current_year = int(paragraph[:-1])
            current_lines = []
        elif current_year is not None:
            current_lines.append(paragraph)

    if current_year is not None:
        sections.append((current_year, current_lines))

    return sections


def collect_block(lines: list[str], start_label: str, stop_labels: tuple[str, ...]) -> list[str]:
    result = []
    active = False
    for line in lines:
        if line.startswith(start_label):
            active = True
            tail = line.replace(start_label, "", 1).strip()
            if tail:
                result.append(tail)
            continue
        if active and any(line.startswith(label) for label in stop_labels):
            break
        if active:
            result.append(line)
    return [item for item in result if item and item != "（找不到）" and item != "找不到"]


def parse_winners(year: int, lines: list[str]) -> list[dict]:
    winner_lines = collect_block(lines, "得主：", ("经典理论：", "精彩名言："))
    winners = []
    for index, line in enumerate(winner_lines, start=1):
        match = WINNER_LINE_RE.match(line)
        if match:
            name_zh, name_en, country = match.groups()
        else:
            name_zh, name_en, country = line, "", ""
        winners.append({
            "id": slugify_name(name_en or name_zh, year, index),
            "year": year,
            "decade": decade_for_year(year),
            "nameZh": name_zh.strip(),
            "nameEn": name_en.strip(),
            "country": country.strip(),
        })
    return winners


def parse_named_block(block: list[str], name_zh: str) -> str:
    prefix = f"{name_zh}："
    for line in block:
        if line.startswith(prefix):
            return line.replace(prefix, "", 1).strip()
    if len(block) == 1:
        return block[0]
    return ""


def short_tag(theory: str) -> str:
    if not theory:
        return "经济学贡献"
    text = re.split(r"[，。,；;（(]", theory)[0]
    return text[:8]


def build_records() -> list[dict]:
    records = []
    for year, lines in split_sections(read_paragraphs()):
        winners = parse_winners(year, lines)
        theory_block = collect_block(lines, "经典理论：", ("精彩名言：",))
        quote_block = collect_block(lines, "精彩名言：", tuple())

        for winner in winners:
            theory = parse_named_block(theory_block, winner["nameZh"]) or " ".join(theory_block).strip()
            quote = parse_named_block(quote_block, winner["nameZh"]) or " ".join(quote_block).strip()
            winner["theory"] = theory
            winner["theoryTag"] = short_tag(theory)
            winner["quote"] = quote
            winner["bio"] = f"{winner['nameZh']}因其在{winner['theoryTag']}等领域的代表性贡献获得诺贝尔经济学奖。"
            winner["portrait"] = ""
            records.append(winner)

    return records


def extract_media() -> None:
    PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(DOCX_PATH) as archive:
        for member in archive.namelist():
            if member.startswith("word/media/") and not member.endswith("/"):
                target = PORTRAIT_DIR / Path(member).name.lower()
                with archive.open(member) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)


def main() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    extract_media()
    records = build_records()
    DATA_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} records to {DATA_PATH}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the extractor**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_laureates.py
```

Expected: stdout includes `Wrote` and `src/data/laureates.json` exists.

- [ ] **Step 3: Inspect generated data**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node -e "const d=require('./src/data/laureates.json'); console.log(d.length, d[0], d.at(-1));"
```

Expected: record count is greater than 57, first year is 1969, last year is 2025.

## Task 4: Add Data Shape Tests

**Files:**
- Create: `tests/dataShape.test.mjs`
- Modify: `scripts/extract_laureates.py` if tests reveal extraction defects.

- [ ] **Step 1: Write data tests**

Create `tests/dataShape.test.mjs` with:

```js
import test from "node:test";
import assert from "node:assert/strict";
import laureates from "../src/data/laureates.json" with { type: "json" };

test("data covers 1969 through 2025", () => {
  const years = laureates.map((item) => item.year);
  assert.equal(Math.min(...years), 1969);
  assert.equal(Math.max(...years), 2025);
});

test("each laureate has required public display fields", () => {
  for (const item of laureates) {
    assert.ok(item.id, "id is required");
    assert.ok(item.nameZh, `${item.id} missing Chinese name`);
    assert.ok(item.year >= 1969 && item.year <= 2025, `${item.id} has invalid year`);
    assert.ok(item.decade, `${item.id} missing decade`);
    assert.ok(item.theoryTag, `${item.id} missing theory tag`);
  }
});

test("missing-source markers are not displayed as content", () => {
  const serialized = JSON.stringify(laureates);
  assert.equal(serialized.includes("找不到"), false);
});
```

- [ ] **Step 2: Run data tests**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/dataShape.test.mjs
```

Expected: PASS. If a generated field fails, update `scripts/extract_laureates.py`, rerun the extractor, and rerun this command.

## Task 5: Render Interactive Gallery

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement app rendering**

Replace `src/app.js` with:

```js
import {
  getDecades,
  getInitialSelection,
  getLaureatesForDecade,
  getNextLaureate,
} from "./laureateState.js";

const app = document.querySelector("#app");
const AUTO_ADVANCE_MS = 30_000;

let laureates = [];
let state = {
  activeDecade: "",
  activeLaureateId: "",
};
let timer = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function initials(name) {
  return [...(name || "诺奖")].slice(0, 2).join("");
}

function findActiveLaureate() {
  return laureates.find((item) => item.id === state.activeLaureateId) ?? laureates[0];
}

function renderPortrait(item, sizeClass = "") {
  if (item.portrait) {
    return `<img class="portrait ${sizeClass}" src="${escapeHtml(item.portrait)}" alt="${escapeHtml(item.nameZh)}">`;
  }
  return `<div class="portrait initials ${sizeClass}" aria-hidden="true">${escapeHtml(initials(item.nameZh))}</div>`;
}

function renderDecadeButtons() {
  return getDecades(laureates)
    .map((decade) => `
      <button class="decade-button ${decade === state.activeDecade ? "is-active" : ""}" data-decade="${escapeHtml(decade)}">
        ${escapeHtml(decade)}
      </button>
    `)
    .join("");
}

function renderCards() {
  const cards = getLaureatesForDecade(laureates, state.activeDecade);
  if (cards.length === 0) {
    return `<section class="empty-state">该年代暂无可展示数据。</section>`;
  }

  return cards
    .map((item) => `
      <button class="laureate-card ${item.id === state.activeLaureateId ? "is-active" : ""}" data-id="${escapeHtml(item.id)}">
        ${renderPortrait(item)}
        <span class="card-name">${escapeHtml(item.nameZh)}</span>
        <span class="card-meta">${escapeHtml(item.year)} · ${escapeHtml(item.theoryTag)}</span>
      </button>
    `)
    .join("");
}

function renderDetail() {
  const item = findActiveLaureate();
  if (!item) {
    return `<aside class="detail-panel"><p>请选择一位经济学家。</p></aside>`;
  }

  return `
    <aside class="detail-panel">
      <div class="detail-year">${escapeHtml(item.year)} 年获奖者</div>
      <div class="detail-head">
        ${renderPortrait(item, "portrait-large")}
        <div>
          <h2>${escapeHtml(item.nameZh)}</h2>
          <p>${escapeHtml([item.nameEn, item.country].filter(Boolean).join(" · "))}</p>
        </div>
      </div>
      <section>
        <h3>经典理论</h3>
        <p>${escapeHtml(item.theory)}</p>
      </section>
      ${item.quote ? `
        <section>
          <h3>精彩名言</h3>
          <blockquote>${escapeHtml(item.quote)}</blockquote>
        </section>
      ` : ""}
      ${item.bio ? `
        <section>
          <h3>人物简介</h3>
          <p>${escapeHtml(item.bio)}</p>
        </section>
      ` : ""}
    </aside>
  `;
}

function render() {
  app.innerHTML = `
    <header class="wall-header">
      <div>
        <p>浙江大学经济学院 学科思政基地</p>
        <h1>诺贝尔经济学奖得主</h1>
      </div>
      <nav class="decade-nav" aria-label="按年代筛选">
        ${renderDecadeButtons()}
      </nav>
    </header>
    <section class="wall-layout">
      <div class="gallery-grid" aria-label="获奖者头像矩阵">
        ${renderCards()}
      </div>
      ${renderDetail()}
    </section>
  `;
}

function resetAutoAdvance() {
  window.clearInterval(timer);
  timer = window.setInterval(() => {
    const next = getNextLaureate(laureates, state.activeLaureateId);
    if (!next) return;
    state.activeLaureateId = next.id;
    state.activeDecade = next.decade;
    render();
  }, AUTO_ADVANCE_MS);
}

function handleClick(event) {
  const decadeButton = event.target.closest("[data-decade]");
  const laureateCard = event.target.closest("[data-id]");

  if (decadeButton) {
    state.activeDecade = decadeButton.dataset.decade;
    const [first] = getLaureatesForDecade(laureates, state.activeDecade);
    state.activeLaureateId = first?.id ?? "";
    render();
    resetAutoAdvance();
  }

  if (laureateCard) {
    const selected = laureates.find((item) => item.id === laureateCard.dataset.id);
    if (selected) {
      state.activeLaureateId = selected.id;
      state.activeDecade = selected.decade;
      render();
      resetAutoAdvance();
    }
  }
}

async function boot() {
  try {
    const response = await fetch("src/data/laureates.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    laureates = await response.json();
    state = getInitialSelection(laureates);
    app.addEventListener("click", handleClick);
    render();
    resetAutoAdvance();
  } catch (error) {
    app.innerHTML = `
      <section class="error-state">
        <p>资料载入失败，请检查本地数据文件。</p>
        <small>${escapeHtml(error.message)}</small>
      </section>
    `;
  }
}

boot();
```

- [ ] **Step 2: Implement full visual styles**

Append to `src/styles.css`:

```css
.wall-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 24px;
}

.wall-header p {
  margin: 0 0 8px;
  color: var(--gold);
  font-size: clamp(18px, 1.3vw, 28px);
  font-weight: 700;
}

.wall-header h1 {
  margin: 0;
  font-size: clamp(34px, 3vw, 68px);
  line-height: 1.08;
  letter-spacing: 0;
}

.decade-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  max-width: 58vw;
}

.decade-button,
.laureate-card {
  border: 0;
  cursor: pointer;
}

.decade-button {
  min-height: 56px;
  padding: 0 22px;
  background: var(--green);
  color: var(--panel);
  font-size: clamp(16px, 1vw, 22px);
  font-weight: 700;
}

.decade-button.is-active {
  background: var(--gold);
  color: var(--bg);
}

.wall-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(360px, 0.92fr);
  gap: 24px;
  align-items: stretch;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(132px, 1fr));
  gap: 14px;
  align-content: start;
}

.laureate-card {
  min-height: 190px;
  padding: 16px 12px 14px;
  background: var(--panel);
  color: var(--ink);
  border-top: 5px solid transparent;
  display: grid;
  justify-items: center;
  gap: 8px;
  text-align: center;
}

.laureate-card.is-active {
  border-top-color: var(--gold);
  box-shadow: inset 0 0 0 3px rgba(210, 168, 77, 0.38);
}

.portrait {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, var(--gold), var(--blue));
  color: var(--ink);
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 800;
}

.portrait-large {
  width: 128px;
  height: 128px;
  font-size: 42px;
  flex: 0 0 auto;
}

.card-name {
  font-size: clamp(17px, 1.05vw, 24px);
  font-weight: 800;
  line-height: 1.22;
}

.card-meta {
  color: #5d655f;
  font-size: clamp(13px, 0.85vw, 18px);
  line-height: 1.25;
}

.detail-panel {
  background: var(--panel);
  color: var(--ink);
  border-left: 6px solid var(--gold);
  padding: clamp(20px, 2vw, 34px);
  min-height: 620px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-year,
.detail-panel h3 {
  color: var(--gold-dark);
  font-weight: 900;
}

.detail-year {
  font-size: clamp(16px, 1vw, 22px);
}

.detail-head {
  display: flex;
  gap: 18px;
  align-items: center;
}

.detail-head h2 {
  margin: 0 0 8px;
  font-size: clamp(30px, 2.4vw, 56px);
  line-height: 1.1;
  letter-spacing: 0;
}

.detail-head p,
.detail-panel section p {
  margin: 0;
}

.detail-head p {
  color: var(--muted);
  font-size: clamp(15px, 1vw, 22px);
}

.detail-panel h3 {
  margin: 0 0 8px;
  font-size: clamp(16px, 1vw, 22px);
}

.detail-panel section p {
  font-size: clamp(18px, 1.25vw, 28px);
  line-height: 1.55;
}

blockquote {
  margin: 0;
  font-size: clamp(22px, 1.55vw, 34px);
  line-height: 1.45;
  font-weight: 900;
}

.empty-state {
  min-height: 280px;
  display: grid;
  place-items: center;
  background: var(--panel);
  color: var(--ink);
  font-size: 24px;
}

@media (max-width: 1100px) {
  .wall-header,
  .wall-layout {
    display: block;
  }

  .decade-nav {
    justify-content: flex-start;
    max-width: none;
    margin-top: 18px;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    margin-bottom: 18px;
  }
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: PASS.

## Task 6: Browser Verification And Polish

**Files:**
- Modify: `src/styles.css`
- Modify: `src/app.js` only if browser verification reveals interaction defects.

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 8080
```

Expected: server listens on `http://localhost:8080`.

- [ ] **Step 2: Open the page in the in-app browser**

Open:

```text
http://localhost:8080
```

Expected: the Nobel economics wall loads directly with decade buttons, avatar matrix, and a detail panel.

- [ ] **Step 3: Verify interaction manually**

Use the browser to check:

- Click `1980s`; visible cards change and first 1980s laureate becomes active.
- Click any visible laureate card; detail panel updates.
- Return to `1969-1979`; active state remains visible.

- [ ] **Step 4: Verify layout sizes**

Use browser screenshots or responsive viewport checks for:

- Wide wall-like viewport around 4096x1213 or same aspect ratio.
- Desktop viewport around 1440x900.

Expected: text remains readable, cards do not overlap, detail panel does not cover the gallery, and buttons remain large enough for touch.

- [ ] **Step 5: Apply small polish fixes**

If browser verification finds overlap or cramped text, adjust only `src/styles.css` using concrete changes such as:

```css
.gallery-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
```

or:

```css
.detail-panel {
  min-height: auto;
}
```

- [ ] **Step 6: Rerun tests after polish**

Run:

```bash
/Users/gaia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/*.test.mjs
```

Expected: PASS.

## Task 7: GitHub Repository Setup

**Files:**
- Create: `.gitignore`
- Modify: local git metadata only after the user provides the remote URL.

- [ ] **Step 1: Create `.gitignore`**

Create `.gitignore` with:

```gitignore
.DS_Store
.superpowers/
node_modules/
```

- [ ] **Step 2: Initialize git if needed**

Run:

```bash
git init
git add .
git commit -m "feat: build nobel economics interactive wall"
```

Expected: commit succeeds.

- [ ] **Step 3: Add GitHub remote after URL is known**

Run after the user provides the repository URL:

```bash
git remote add origin <GITHUB_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

Expected: project is pushed to the `nobel-economics-wall` GitHub repository.

## Self-Review

- Spec coverage: The plan implements full 1969-2025 coverage, decade navigation, avatar matrix, detail panel, offline local data loading, missing portrait fallback, auto-advance, and browser verification.
- Placeholder scan: The only angle-bracket token is `<GITHUB_REPOSITORY_URL>`, which is intentionally blocked on user-provided remote information in the GitHub setup task.
- Type consistency: Data fields are consistently named `id`, `year`, `decade`, `nameZh`, `nameEn`, `country`, `theoryTag`, `theory`, `quote`, `bio`, and `portrait` across extractor, tests, and UI.
