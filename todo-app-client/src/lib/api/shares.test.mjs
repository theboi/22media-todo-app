import test from "node:test";
import assert from "node:assert/strict";
import { readShares } from "./share-resources.ts";
import { request } from "./lists.ts";
const share = { id: "invite", todo_list_id: "list", todo_list_name: "Reading", email: "friend@example.com", shared_by: { user_id: "owner", email: "owner@example.com" }, status: "pending" };
test("invitation parsing preserves recipient, sender and status and rejects malformed responses", () => {
  assert.deepEqual(readShares([share]), [{ id: "invite", listId: "list", listName: "Reading", email: "friend@example.com", sender: "owner@example.com", status: "pending" }]);
  for (const value of [null, {}, [null], [{ ...share, status: "expired" }], [{ ...share, shared_by: null }], [{ ...share, email: 2 }]]) assert.throws(() => readShares(value), /invalid/i);
});
test("unverified invitation acceptance exposes a recoverable error code", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ error: { code: "EMAIL_NOT_VERIFIED" } }, { status: 403 }));
  await assert.rejects(request("http://test", "/shares/invite/accept", "token", new AbortController().signal, undefined, { method: "POST", key: "accept-key" }), error => error.code === "EMAIL_NOT_VERIFIED" && /verify/i.test(error.message));
});
