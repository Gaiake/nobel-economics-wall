import test from "node:test";
import assert from "node:assert/strict";
import {
  DISPLAY,
  IDLE_RESET_MS,
  getDisplayRegions,
  getInitialShellState,
  getNextShellState,
  NAV_ITEMS,
} from "../src/displayShell.js";

test("display constants match the six-screen wall", () => {
  assert.deepEqual(DISPLAY, {
    width: 6480,
    height: 1980,
    panelWidth: 1080,
    panelHeight: 1980,
    panels: 6,
  });
});

test("display regions split the wall into navigation, middle, and market areas", () => {
  assert.deepEqual(getDisplayRegions(), {
    nav: { x: 0, y: 0, width: 1080, height: 1980 },
    middle: { x: 1080, y: 0, width: 2160, height: 1980 },
    market: { x: 3240, y: 0, width: 3240, height: 1980 },
  });
});

test("shell starts on the default Nobel module", () => {
  assert.deepEqual(getInitialShellState(1000), {
    activeModule: "nobel",
    lastInteractionAt: 1000,
  });
});

test("navigation changes the middle module and records interaction time", () => {
  assert.deepEqual(getNextShellState(getInitialShellState(1000), "game-market", 2000), {
    activeModule: "game-market",
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
    ["nobel", "game-market", "game-auction", "game-allocation"],
  );
});
