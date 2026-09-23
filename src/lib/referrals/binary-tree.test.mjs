import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("./binary-tree.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { buildBinaryLevels, countBinaryDescendants, visibleBinaryDepth } = await import(`data:text/javascript,${encodeURIComponent(compiled)}`);

const root = { id: "root", name: "You", level: 0 };
const members = [
  { id: "a", parentId: "root", side: "LEFT", level: 1, name: "A" },
  { id: "b", parentId: "root", side: "RIGHT", level: 1, name: "B" },
  { id: "c", parentId: "a", side: "LEFT", level: 2, name: "C" },
  { id: "d", parentId: "b", side: "RIGHT", level: 2, name: "D" },
  { id: "e", parentId: "c", side: "LEFT", level: 3, name: "E" },
];

test("binary rows double from 1 through 32 while preserving Left and Right", () => {
  const rows = buildBinaryLevels(root, members);
  assert.deepEqual(rows.map((row) => row.length), [1, 2, 4, 8]);
  assert.deepEqual(rows[1].map((slot) => slot.person?.id ?? null), ["a", "b"]);
  assert.deepEqual(rows[2].map((slot) => slot.person?.id ?? null), ["c", null, null, "d"]);
  assert.equal(rows[2][0].side, "LEFT");
  assert.equal(rows[2][1].side, "RIGHT");
  assert.equal(rows[3][0].person?.id, "e");
  assert.equal(rows[3][2].parentId, null);
  assert.deepEqual(
    buildBinaryLevels(root, members, 5).map((row) => row.length),
    [1, 2, 4, 8, 16, 32],
  );
});

test("focusing a member shows only positions beneath that member", () => {
  const rows = buildBinaryLevels(members[0], members);
  assert.deepEqual(rows[1].map((slot) => slot.person?.id ?? null), ["c", null]);
  assert.deepEqual(rows[2].map((slot) => slot.person?.id ?? null), ["e", null, null, null]);
  assert.ok(rows.flat().every((slot) => slot.person?.id !== "b"));
});

test("only occupied rows are visible", () => {
  assert.equal(visibleBinaryDepth(buildBinaryLevels(root, [])), 0);
  assert.equal(visibleBinaryDepth(buildBinaryLevels(root, members.slice(0, 1))), 1);
  assert.equal(visibleBinaryDepth(buildBinaryLevels(root, members.slice(0, 2))), 1);
  assert.equal(visibleBinaryDepth(buildBinaryLevels(root, members.slice(0, 3))), 2);
  assert.equal(visibleBinaryDepth(buildBinaryLevels(root, members.slice(0, 6))), 3);
});

test("each card counts immediate and deeper binary descendants", () => {
  const counts = countBinaryDescendants(root.id, members);
  assert.deepEqual(counts.get("root"), { direct: 2, indirect: 3 });
  assert.deepEqual(counts.get("a"), { direct: 1, indirect: 1 });
  assert.deepEqual(counts.get("b"), { direct: 1, indirect: 0 });
  assert.deepEqual(counts.get("e"), { direct: 0, indirect: 0 });
});
