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
    const positionStyle = item.portraitPosition
      ? ` style="object-position: ${escapeHtml(item.portraitPosition)}"`
      : "";
    return `<img class="portrait ${sizeClass}" src="${escapeHtml(item.portrait)}" alt="${escapeHtml(item.nameZh)}"${positionStyle}>`;
  }
  return `<div class="portrait initials ${sizeClass}" aria-hidden="true">${escapeHtml(initials(item.nameZh))}</div>`;
}

function renderDecadeButtons() {
  return getDecades(laureates)
    .map(
      (decade) => `
        <button class="decade-button ${decade === state.activeDecade ? "is-active" : ""}" data-decade="${escapeHtml(decade)}">
          ${escapeHtml(decade)}
        </button>
      `,
    )
    .join("");
}

function renderCards() {
  const cards = getLaureatesForDecade(laureates, state.activeDecade);
  if (cards.length === 0) {
    return `<section class="empty-state">该年代暂无可展示数据。</section>`;
  }

  return cards
    .map(
      (item) => `
        <button class="laureate-card ${item.id === state.activeLaureateId ? "is-active" : ""}" data-id="${escapeHtml(item.id)}">
          ${renderPortrait(item)}
          <span class="card-name">${escapeHtml(item.nameZh)}</span>
          <span class="card-meta">${escapeHtml(item.year)} · ${escapeHtml(item.theoryTag)}</span>
        </button>
      `,
    )
    .join("");
}

function renderDetail() {
  const item = findActiveLaureate();
  if (!item) {
    return `<aside class="detail-panel"><p>请选择一位经济学家。</p></aside>`;
  }

  return `
    <aside class="detail-panel" data-active-id="${escapeHtml(item.id)}">
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
      ${
        item.quote
          ? `
            <section>
              <h3>精彩名言</h3>
              <blockquote>${escapeHtml(item.quote)}</blockquote>
            </section>
          `
          : ""
      }
      ${
        item.bio
          ? `
            <section>
              <h3>人物简介</h3>
              <p>${escapeHtml(item.bio)}</p>
            </section>
          `
          : ""
      }
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
    return;
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
