import {
  DEFAULT_MODULE,
  FUTURES_BOOKCASE_URL,
  INVESTOR_GAMES,
  NAV_ITEMS,
  getInitialShellState,
  getNextShellState,
} from "./displayShell.js";
import {
  getDecades,
  getInitialSelection,
  getLaureatesForDecade,
  getNextLaureate,
} from "./laureateState.js";

const app = document.querySelector("#app");
const NOBEL_AUTO_ADVANCE_MS = 30_000;
const SHELL_TICK_MS = 1_000;

let laureates = [];
let shellState = getInitialShellState();
let nobelState = {
  activeDecade: "",
  activeLaureateId: "",
};
let activeEmbed = {
  title: "",
  url: "",
};
let nobelTimer = null;
let shellTimer = null;

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
  return laureates.find((item) => item.id === nobelState.activeLaureateId) ?? laureates[0];
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

function renderNavigation() {
  return `
    <aside class="nav-panel" aria-label="大屏导航">
      <div class="nav-brand">
        <p>浙江大学经济学院</p>
        <h1>学科思政基地</h1>
        <span>执善向上 · 经世济民</span>
      </div>
      <nav class="nav-actions">
        ${NAV_ITEMS.map(
          (item) => `
            <button class="nav-button ${item.id === shellState.activeModule ? "is-active" : ""}" data-module="${escapeHtml(item.id)}">
              <span>${escapeHtml(item.label)}</span>
              <small>${escapeHtml(item.description)}</small>
            </button>
          `,
        ).join("")}
      </nav>
      <div class="nav-idle">
        <strong>空闲回退</strong>
        <span>5 分钟无触屏自动回到诺奖展示</span>
      </div>
    </aside>
  `;
}

function renderDecadeButtons() {
  return getDecades(laureates)
    .map(
      (decade) => `
        <button class="decade-button ${decade === nobelState.activeDecade ? "is-active" : ""}" data-decade="${escapeHtml(decade)}">
          ${escapeHtml(decade)}
        </button>
      `,
    )
    .join("");
}

function renderCards() {
  const cards = getLaureatesForDecade(laureates, nobelState.activeDecade);
  if (cards.length === 0) {
    return `<section class="empty-state">该年代暂无可展示数据。</section>`;
  }

  return cards
    .map(
      (item) => `
        <button class="laureate-card ${item.id === nobelState.activeLaureateId ? "is-active" : ""}" data-id="${escapeHtml(item.id)}">
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

function renderNobelModule() {
  return `
    <section class="middle-module nobel-module">
      <header class="wall-header">
        <div>
          <p>诺贝尔经济学奖得主</p>
          <h2>思想、理论与时代回应</h2>
        </div>
      </header>
      <section class="nobel-layout">
        <div class="gallery-grid" aria-label="获奖者头像矩阵">
          ${renderCards()}
        </div>
        ${renderDetail()}
      </section>
      <footer class="nobel-footer">
        <span>按年代筛选</span>
        <nav class="decade-nav" aria-label="按年代筛选">
          ${renderDecadeButtons()}
        </nav>
      </footer>
    </section>
  `;
}

function renderEmbedFrame(title, url) {
  return `
    <section class="embed-stage" aria-label="${escapeHtml(title)}">
      <div class="embed-toolbar">
        <div>
          <span>正在展示</span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener">新窗口打开</a>
      </div>
      <iframe class="embed-frame" src="${escapeHtml(url)}" title="${escapeHtml(title)}"></iframe>
    </section>
  `;
}

function renderInvestorGamesModule() {
  return `
    <section class="middle-module interactive-module">
      <header class="interactive-header">
        <div>
          <p>模块一</p>
          <h2>上交所投教小游戏</h2>
        </div>
        <button class="return-button" data-module="${DEFAULT_MODULE}">返回诺奖展示</button>
      </header>
      <div class="interactive-layout ${activeEmbed.url ? "has-frame" : ""}">
        <div class="interactive-actions" aria-label="投教小游戏列表">
          ${INVESTOR_GAMES.map(
            (game) => `
              <button class="interactive-card ${game.url === activeEmbed.url ? "is-active" : ""}" data-embed-title="${escapeHtml(game.title)}" data-embed-url="${escapeHtml(game.url)}">
                <span>投教互动</span>
                <strong>${escapeHtml(game.title)}</strong>
                <small>${escapeHtml(game.description)}</small>
              </button>
            `,
          ).join("")}
        </div>
        ${
          activeEmbed.url
            ? renderEmbedFrame(activeEmbed.title, activeEmbed.url)
            : `
              <section class="interactive-welcome">
                <span>请选择左侧游戏</span>
                <strong>触屏后在中间两屏内打开互动内容</strong>
                <p>5 分钟无操作会自动回到诺贝尔经济学奖展示。</p>
              </section>
            `
        }
      </div>
    </section>
  `;
}

function renderBookcaseModule() {
  return `
    <section class="middle-module interactive-module bookcase-module">
      <header class="interactive-header">
        <div>
          <p>模块三</p>
          <h2>上海期货交易所电子书橱</h2>
        </div>
        <button class="return-button" data-module="${DEFAULT_MODULE}">返回诺奖展示</button>
      </header>
      ${renderEmbedFrame("上海期货交易所电子书橱", FUTURES_BOOKCASE_URL)}
    </section>
  `;
}

function renderMiddleModule() {
  if (shellState.activeModule === "investor-games") return renderInvestorGamesModule();
  if (shellState.activeModule === "futures-books") return renderBookcaseModule();
  return renderNobelModule();
}

function render() {
  app.innerHTML = `
    <section class="screen-shell">
      ${renderNavigation()}
      <main class="middle-panel">
        ${renderMiddleModule()}
      </main>
    </section>
  `;
}

function resetNobelAutoAdvance() {
  window.clearInterval(nobelTimer);
  nobelTimer = window.setInterval(() => {
    if (shellState.activeModule !== DEFAULT_MODULE) return;
    const next = getNextLaureate(laureates, nobelState.activeLaureateId);
    if (!next) return;
    nobelState.activeLaureateId = next.id;
    nobelState.activeDecade = next.decade;
    render();
  }, NOBEL_AUTO_ADVANCE_MS);
}

function markInteraction(now = Date.now()) {
  shellState = {
    ...shellState,
    lastInteractionAt: now,
  };
}

function handleClick(event) {
  markInteraction();

  const moduleButton = event.target.closest("[data-module]");
  const embedButton = event.target.closest("[data-embed-url]");
  const decadeButton = event.target.closest("[data-decade]");
  const laureateCard = event.target.closest("[data-id]");

  if (embedButton) {
    activeEmbed = {
      title: embedButton.dataset.embedTitle,
      url: embedButton.dataset.embedUrl,
    };
    render();
    return;
  }

  if (moduleButton) {
    shellState = getNextShellState(shellState, moduleButton.dataset.module);
    activeEmbed = { title: "", url: "" };
    render();
    resetNobelAutoAdvance();
    return;
  }

  if (decadeButton) {
    nobelState.activeDecade = decadeButton.dataset.decade;
    const [first] = getLaureatesForDecade(laureates, nobelState.activeDecade);
    nobelState.activeLaureateId = first?.id ?? "";
    render();
    resetNobelAutoAdvance();
    return;
  }

  if (laureateCard) {
    const selected = laureates.find((item) => item.id === laureateCard.dataset.id);
    if (selected) {
      nobelState.activeLaureateId = selected.id;
      nobelState.activeDecade = selected.decade;
      render();
      resetNobelAutoAdvance();
    }
  }
}

function startShellIdleTimer() {
  window.clearInterval(shellTimer);
  shellTimer = window.setInterval(() => {
    const nextState = getNextShellState(shellState, "tick");
    if (nextState.activeModule !== shellState.activeModule) {
      shellState = nextState;
      activeEmbed = { title: "", url: "" };
      render();
      resetNobelAutoAdvance();
      return;
    }
    shellState = nextState;
  }, SHELL_TICK_MS);
}

function bindGlobalActivity() {
  for (const eventName of ["pointerdown", "touchstart", "keydown"]) {
    window.addEventListener(eventName, () => markInteraction(), { passive: true });
  }
}

async function boot() {
  try {
    const response = await fetch("src/data/laureates.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    laureates = await response.json();
    nobelState = getInitialSelection(laureates);
    shellState = getInitialShellState();
    activeEmbed = { title: "", url: "" };
    app.addEventListener("click", handleClick);
    bindGlobalActivity();
    render();
    resetNobelAutoAdvance();
    startShellIdleTimer();
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
