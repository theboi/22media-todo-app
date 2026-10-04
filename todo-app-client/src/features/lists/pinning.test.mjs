import test from "node:test";
import assert from "node:assert/strict";
import { selectedPins } from "./pinning.ts";
const lists = [{ id: "a" }, { id: "b" }, { id: "c" }];
test("pin selection can remove existing pins and preserve the order of retained pins", () => {
  assert.deepEqual(selectedPins(lists, ["b", "a"], ["a", "c"]), ["a", "c"]);
  assert.deepEqual(selectedPins(lists, ["b", "a"], ["a", "b", "c"]), ["b", "a", "c"]);
});
test("empty pin selection clears all Home sections", () => {
  assert.deepEqual(selectedPins(lists, ["a", "b"], []), []);
});
test("pin selection drops inaccessible ids and duplicates without mutating inputs", () => {
  const pinned = ["missing", "b", "b"], selected = ["b", "c", "c", "gone"];
  assert.deepEqual(selectedPins(lists, pinned, selected), ["b", "c"]);
  assert.deepEqual(pinned, ["missing", "b", "b"]);
  assert.deepEqual(selected, ["b", "c", "c", "gone"]);
});
