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
