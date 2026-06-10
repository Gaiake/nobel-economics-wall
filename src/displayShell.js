export const DISPLAY = {
  width: 6480,
  height: 1920,
  panelWidth: 1080,
  panelHeight: 1920,
  panels: 6,
};

export const APP_DISPLAY = {
  width: DISPLAY.panelWidth * 3,
  height: DISPLAY.panelHeight,
  panelWidth: DISPLAY.panelWidth,
  panelHeight: DISPLAY.panelHeight,
  panels: 3,
};

export const IDLE_RESET_MS = 5 * 60 * 1000;
export const DEFAULT_MODULE = "nobel";
export const FUTURES_BOOKCASE_URL = "https://book.yunzhan365.com/bookcase/bgmtc/index.html?foldId=-1";

export const INVESTOR_GAMES = [
  {
    title: "期货玩家",
    description: "用游戏方式理解期货交易与风险管理。",
    url: "https://work.jingjia-tech.com/csm/game/zzb1.html",
    frameMode: "compact",
  },
  {
    title: "红色证券史",
    description: "在互动探索中了解中国证券市场的发展脉络。",
    url: "https://spa.museshow.cn/csm/game/finder/",
  },
  {
    title: "中国证券博物馆",
    description: "通过数字展陈走近证券文化与金融历史。",
    url: "https://spa.museshow.cn/csm/game/diary/",
  },
];

export const NAV_ITEMS = [
  {
    id: "nobel",
    label: "诺奖经济学家",
    description: "默认展示",
  },
  {
    id: "investor-games",
    label: "投教小游戏",
    description: "上交所投教",
  },
  {
    id: "futures-books",
    label: "电子书橱",
    description: "期货所资源",
  },
];

export function getDisplayRegions() {
  return {
    nav: { x: 0, y: 0, width: DISPLAY.panelWidth, height: DISPLAY.panelHeight },
    middle: { x: DISPLAY.panelWidth, y: 0, width: DISPLAY.panelWidth * 2, height: DISPLAY.panelHeight },
    market: { x: DISPLAY.panelWidth * 3, y: 0, width: DISPLAY.panelWidth * 3, height: DISPLAY.panelHeight },
  };
}

export function getInitialShellState(now = Date.now()) {
  return {
    activeModule: DEFAULT_MODULE,
    lastInteractionAt: now,
  };
}

export function getNextShellState(state, action, now = Date.now()) {
  if (action === "tick") {
    if (now - state.lastInteractionAt > IDLE_RESET_MS) {
      return {
        activeModule: DEFAULT_MODULE,
        lastInteractionAt: now,
      };
    }
    return state;
  }

  const targetModule = NAV_ITEMS.some((item) => item.id === action) ? action : DEFAULT_MODULE;
  return {
    activeModule: targetModule,
    lastInteractionAt: now,
  };
}
