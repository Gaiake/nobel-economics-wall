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
