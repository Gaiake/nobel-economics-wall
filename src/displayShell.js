export const DISPLAY = {
  width: 6480,
  height: 1980,
  panelWidth: 1080,
  panelHeight: 1980,
  panels: 6,
};

export const IDLE_RESET_MS = 5 * 60 * 1000;
export const DEFAULT_MODULE = "nobel";

export const NAV_ITEMS = [
  {
    id: "nobel",
    label: "诺奖经济学家",
    description: "默认展示",
  },
  {
    id: "game-market",
    label: "市场竞价",
    description: "互动小游戏",
  },
  {
    id: "game-auction",
    label: "拍卖实验",
    description: "互动小游戏",
  },
  {
    id: "game-allocation",
    label: "资源配置",
    description: "互动小游戏",
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
