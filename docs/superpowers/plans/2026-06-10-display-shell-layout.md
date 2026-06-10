# Display Shell Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Nobel wall into a 6480x1980 six-screen display shell with left navigation, middle interactive area, right external market/news area, and 5-minute idle reset.

**Architecture:** Keep the app as a static browser page. Add pure layout/state helpers for the 1:2:3 screen split and idle timeout, then render the existing Nobel experience inside the middle two-screen region while leaving the right three-screen region as an external-window guide/placeholder.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Node.js built-in test runner.

---

## Tasks

- [x] Add `src/displayShell.js` with screen dimensions, region definitions, nav item metadata, and idle state helper.
- [x] Add `tests/displayShell.test.mjs` covering 6480x1980 dimensions, 1080/2160/3240 region split, and 5-minute idle reset.
- [x] Refactor `src/app.js` to render left navigation, middle active module, and right external market/news placeholder.
- [x] Adapt `src/styles.css` for the 6-panel shell and middle-region Nobel layout.
- [x] Run all tests and add CSS layout coverage for the 1:2:3 shell split.
- [ ] Browser-check a 6480x1980 viewport. Local directory serving and headless browser launch were blocked by the desktop sandbox, so this needs final manual validation on the display host.
- [ ] Commit and push.
