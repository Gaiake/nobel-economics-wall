import test from "node:test";
import assert from "node:assert/strict";
import {
  APP_DISPLAY,
  DISPLAY,
  IDLE_RESET_MS,
  INVESTOR_GAMES,
  FUTURES_BOOKCASE_URL,
  getDisplayRegions,
  getInitialShellState,
  getNextShellState,
  NAV_ITEMS,
} from "../src/displayShell.js";

test("display constants match the six-screen wall", () => {
  assert.deepEqual(DISPLAY, {
    width: 6480,
    height: 1920,
    panelWidth: 1080,
    panelHeight: 1920,
    panels: 6,
  });
});

test("app display constants match the left three-screen browser area", () => {
  assert.deepEqual(APP_DISPLAY, {
    width: 3240,
    height: 1920,
    panelWidth: 1080,
    panelHeight: 1920,
    panels: 3,
  });
});

test("display regions split the wall into navigation, middle, and market areas", () => {
  assert.deepEqual(getDisplayRegions(), {
    nav: { x: 0, y: 0, width: 1080, height: 1920 },
    middle: { x: 1080, y: 0, width: 2160, height: 1920 },
    market: { x: 3240, y: 0, width: 3240, height: 1920 },
  });
});

test("shell starts on the default Nobel module", () => {
  assert.deepEqual(getInitialShellState(1000), {
    activeModule: "nobel",
    lastInteractionAt: 1000,
  });
});

test("navigation changes the middle module and records interaction time", () => {
  assert.deepEqual(getNextShellState(getInitialShellState(1000), "investor-games", 2000), {
    activeModule: "investor-games",
    lastInteractionAt: 2000,
  });
});

test("idle timeout returns the middle region to Nobel display", () => {
  const state = { activeModule: "game-market", lastInteractionAt: 1000 };
  assert.equal(IDLE_RESET_MS, 5 * 60 * 1000);
  assert.equal(getNextShellState(state, "tick", 1000 + IDLE_RESET_MS + 1).activeModule, "nobel");
});

test("navigation exposes the default and game modules", () => {
  assert.deepEqual(
    NAV_ITEMS.map((item) => item.id),
    ["nobel", "investor-games", "futures-books"],
  );
});

test("navigation content matches the display copy requirements", () => {
  assert.deepEqual(
    NAV_ITEMS.map((item) => [item.label, item.description, item.support ?? ""]),
    [
      ["诺贝尔经济学奖获得者", "", ""],
      ["科普互动游戏", "", "支持单位：上海证券交易所、中国证券博物馆"],
      ["科普电子书橱", "", "支持单位：上海期货交易所"],
    ],
  );
});

test("investor education module exposes the three configured game links", () => {
  assert.deepEqual(
    INVESTOR_GAMES.map((item) => [item.title, item.url, item.frameMode ?? "wide"]),
    [
      ["期货玩家", "https://work.jingjia-tech.com/csm/game/zzb1.html", "compact"],
      ["红色证券史", "https://spa.museshow.cn/csm/game/finder/", "wide"],
      ["中国证券博物馆", "https://spa.museshow.cn/csm/game/diary/", "wide"],
    ],
  );
});

test("futures bookcase module uses the configured electronic bookcase link", () => {
  assert.equal(FUTURES_BOOKCASE_URL, "https://book.yunzhan365.com/bookcase/bgmtc/index.html?foldId=-1");
});
