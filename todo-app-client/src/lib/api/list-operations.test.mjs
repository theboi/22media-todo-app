import test from "node:test";
import assert from "node:assert/strict";
import { request } from "./lists.ts";
import { readListDetail } from "./list-detail.ts";

test("DELETE carries its retry key and handles an empty 204", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(init.method, "DELETE");
    assert.equal(init.headers["Idempotency-Key"], "operation-id");
    assert.equal(init.body, undefined);
    return new Response(null, { status: 204 });
  });
  assert.equal(
    await request(
      "http://test",
      "/todo-lists/id",
      "token",
      new AbortController().signal,
      undefined,
      { method: "DELETE", key: "operation-id" },
    ),
    undefined,
  );
});
test("detail preserves todo completion and rejects malformed todos", () => {
  const list = {
    id: "list-id",
    name: "Personal",
    description: null,
    icon: "heart",
    color: "#FF8A65",
    role: "owner",
    todos: [
      {
        id: "todo-id",
        name: "Read",
        description: null,
        is_done: false,
        deadline: null,
      },
    ],
  };
  assert.equal(readListDetail(list).todos[0].isDone, false);
  assert.throws(
    () =>
      readListDetail({
        ...list,
        todos: [{ ...list.todos[0], is_done: "false" }],
      }),
    /invalid todo/,
  );
});
