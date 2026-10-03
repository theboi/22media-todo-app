import test from "node:test";
import assert from "node:assert/strict";
import { outstandingTodos } from "./home-data.ts";
test("outstanding orders deadlines then oldest additions and excludes done", () => {
  const todo = (id, deadline, createdAt, isDone = false) => ({
    id,
    deadline,
    createdAt,
    isDone,
  });
  const data = [
    todo("new", null, "2026-10-03"),
    todo("later", "2026-10-06", "2026-10-01"),
    todo("old", null, "2026-10-01"),
    todo("soon", "2026-10-04", "2026-10-02"),
    todo("done", "2026-10-01", "2026-10-01", true),
  ];
  assert.deepEqual(
    outstandingTodos(data).map((t) => t.id),
    ["soon", "later", "old", "new"],
  );
  assert.equal(data[0].id, "new");
});
