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

test("card summaries use curated theory labels instead of sentence fragments", () => {
  const byId = Object.fromEntries(laureates.map((item) => [item.id, item]));

  assert.equal(byId["paul-a-samuelson-1970-1"].theoryTag, "现代经济学");
  assert.equal(byId["daron-acemoglu-2024-1"].theoryTag, "制度与繁荣");
  assert.equal(byId["philippe-aghion-2025-1"].theoryTag, "创造性毁灭");
  assert.equal(byId["joel-mokyr-2025-3"].theoryTag, "技术进步");
});

test("card summaries are concise display labels", () => {
  for (const item of laureates) {
    assert.ok(item.theoryTag.length <= 8, `${item.id} tag is too long`);
    assert.equal(/[：:，,。；;]/.test(item.theoryTag), false, `${item.id} tag has punctuation`);
  }
});

test("off-center source portraits include display focal points", () => {
  const byId = Object.fromEntries(laureates.map((item) => [item.id, item]));

  assert.equal(byId["ragnar-frisch-1969-1"].portraitPosition, "78% 50%");
  assert.equal(byId["george-a-akerlof-2001-1"].portraitPosition, "50% 24%");
});

test("portrait focal points use CSS percentage coordinates", () => {
  for (const item of laureates.filter((entry) => entry.portraitPosition)) {
    assert.match(item.portraitPosition, /^\d{1,3}% \d{1,3}%$/, `${item.id} has invalid portrait position`);
  }
});
