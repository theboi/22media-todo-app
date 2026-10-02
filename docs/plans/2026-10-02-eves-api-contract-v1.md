# Eves API contract v1 — frozen

Date: 2026-10-02
Status: Revised frozen MVP contract per user feedback; no implementation yet.
Authority: This document defines the only client/server contract for the MVP and refines the [PRD](2026-10-02-eves-mvp-prd.md). Client and Laravel use this same v1 contract. No v2, legacy payloads, migration layer, compatibility aliases or backward-compatibility work.

## 1. Conventions

- Base path `/api`; API version stays **v1 throughout MVP**, with `X-Eves-API-Version: 1`. Do not increment the API version for endpoint implementation or data edits.
- **todo.version is a data revision, not the API version.** It starts at integer 1 and increments by one only when persisted editable todo values actually change. Unchanged PATCH/PUT and retries do not increment it. It must change for the requested device-side comparison to work. Lists/settings have no version field.
- Protected routes require `Authorization: Bearer <token>`. Use JSON and `Accept: application/json`; request bodies require `Content-Type: application/json`. HTTPS except local development.
- IDs are lowercase UUID v4 strings for accounts, users, lists, todos, shares, device identifiers and operation keys. Clients generate list/todo IDs, including conflict-copy IDs, before sending creates. Server generates account/user/share IDs. No integer mapping.
- Timestamp output: UTC ISO 8601 milliseconds, e.g. `2026-10-02T04:00:00.000Z`. Deadline input must include an explicit timezone offset and normalizes to UTC milliseconds. Server owns created_at/updated_at. Offline creation ordering is provisional until acknowledged.
- Single responses: `{data: Resource}`; collection responses: `{data: Resource[]}`. No mutation metadata or pagination envelope. Token and snapshot shapes below are explicit exceptions. DELETE/logout/decline/leave successes return 204 with no body.
- Unknown JSON/query fields return 422. Missing differs from null. Boolean input must be JSON true/false. No client-controlled owner, role, timestamps, user identity or todo revision.
- Every GET supports HEAD with identical authorization/status/headers and no body. No HEAD aliases for POST routes. Private/auth responses use `Cache-Control: no-store`.
- Collections are complete and unpaginated for the assignment. Sort list/todo/share collections by created_at then id ascending. Home deadline sorting happens on the device.

### Errors

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request is invalid.",
    "fields": {"name": ["Must contain 1 to 120 characters."]},
    "details": {}
  }
}
```

fields/details are always objects; clients branch on code. No stack traces. HEAD errors have no body.

| HTTP | Codes |
| --- | --- |
| 400 | INVALID_JSON |
| 401 | UNAUTHENTICATED, INVALID_CREDENTIALS |
| 403 | OWNER_REQUIRED, REGISTERED_ACCOUNT_REQUIRED, EMAIL_NOT_VERIFIED |
| 404 | NOT_FOUND (including inaccessible/deleted list/todo/share IDs) |
| 405 | METHOD_NOT_ALLOWED; include Allow |
| 409 | ID_ALREADY_EXISTS, IDEMPOTENCY_KEY_REUSED, ALREADY_REGISTERED, EMAIL_ALREADY_REGISTERED, SHARE_NOT_PENDING, OWNER_CANNOT_LEAVE |
| 415 | UNSUPPORTED_MEDIA_TYPE |
| 422 | VALIDATION_FAILED, INVALID_VERIFICATION_CODE |
| 429 | RATE_LIMITED; include Retry-After seconds |
| 500 | INTERNAL_ERROR |

There are no server conflict-detection/version-precondition errors and no distinct LIST_DELETED/ACCESS_REVOKED codes. Without retained resource history the server cannot reliably distinguish missing/deleted/revoked identities; return 404. The device tells the user a previously cached list is no longer available.

## 2. Resources

### Session

```json
{
  "account": {
    "id": "11111111-1111-4111-8111-111111111111",
    "kind": "guest",
    "user_id": null,
    "first_device": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
  },
  "user": null,
  "settings": {"list_view_layout": []}
}
```

Registered accounts have kind=registered, first_device=null, user_id=user.id; user shape is `{id, email, email_verified_at}`, with nullable verification timestamp. Exactly one of account.user_id/first_device is non-null. One registered account per user. No password hashes or token internals. first_device is metadata, not a credential.

### List

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "name": "Personal",
  "description": null,
  "icon": "droplet",
  "color": "#22C55E",
  "owner_account_id": "11111111-1111-4111-8111-111111111111",
  "role": "owner",
  "created_at": "2026-10-02T04:00:00.000Z",
  "updated_at": "2026-10-02T04:00:00.000Z"
}
```

role=owner|member, relative to caller. GET list detail adds todos: Todo[]; other list responses omit nested todos. Owner-only sharing routes expose emails; list resources do not.

### Todo

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "todo_list_id": "22222222-2222-4222-8222-222222222222",
  "name": "Submit assignment",
  "description": null,
  "is_done": false,
  "deadline": "2026-10-05T09:00:00.000Z",
  "version": 1,
  "created_at": "2026-10-02T04:00:00.000Z",
  "updated_at": "2026-10-02T04:00:00.000Z"
}
```

Editable fields: name, description, is_done, deadline. todo_list_id is immutable after creation. No separate status/list_id/title/conflict_of field. Conflict-copy identification is local UI state, keyed by client-generated new todo ID; server treats a copy as an ordinary todo.

### Share

```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "todo_list_id": "22222222-2222-4222-8222-222222222222",
  "todo_list_name": "Personal",
  "email": "friend@example.com",
  "shared_by": {"user_id": "55555555-5555-4555-8555-555555555555", "email": "owner@example.com"},
  "status": "pending",
  "created_at": "2026-10-02T04:00:00.000Z",
  "updated_at": "2026-10-02T04:00:00.000Z"
}
```

status=pending|accepted. Owners see active shares for their lists; recipients see their own pending shares. Unknown-email shares become discoverable on registration/login. Store share ID/status/creator/timestamps inside server-owned JSON sharing entries if desired; no invitations table is mandated. Bare email strings alone do not encode acceptance state. Revocation/decline/leave physically removes the sharing entry, not a retained historical record.

## 3. Authentication and guest lifecycle

These routes do not require domain idempotency headers. Lost provisioning/login responses may leave unused accounts/tokens; MVP does not restore them through first_device.

| Method / path | Auth | Request | Success |
| --- | --- | --- | --- |
| POST `/api/auth/guest` | Public | `{device_id: UUID}` | 201 token response for a fresh guest |
| POST `/api/auth/register` | Guest bearer | `{email, password, password_confirmation}` | 201 token response; convert current account |
| POST `/api/auth/login` | Public, or guest bearer | `{email, password, device_id: UUID}` | 200 token response for existing registered account |
| GET, HEAD `/api/auth/me` | Any bearer | None | 200 `{data: Session}` |
| POST `/api/auth/logout` | Registered bearer | None | 204; revoke current token only |
| POST `/api/auth/email-verification/request` | Registered bearer | None | 202 `{data: {status: "sent"}}` or 200 `{data: {status: "already_verified"}}` |
| POST `/api/auth/email-verification/confirm` | Registered bearer | `{code: string}` | 200 `{data: Session}` |

Token response: `{data: {token_type: "Bearer", token: string, session: Session}}`. Tokens have no automatic expiry for this demo and must remain revocable. Server supplies guest and registered principals; never accept a submitted account_id as proof of identity.

- Normalize email by trimming and lowercasing, max 254 characters and valid email syntax; this exact normalized value drives identity/sharing. Email is immutable in MVP. Password is 8–128 characters; never trim or change case. Registration requires matching confirmation.
- Registration creates a unique user, links current guest account, clears first_device, preserves lists/layout and replaces the guest token with a registered token atomically. Failure leaves the guest account untouched. If a successful response is lost, the revoked guest token cannot repeat registration; recover by email/password login. Duplicate email returns `409 EMAIL_ALREADY_REGISTERED`; registered caller gets `409 ALREADY_REGISTERED`.
- Login uses email/password; invalid credentials return the same `401 INVALID_CREDENTIALS`. If a guest bearer is supplied, validate it, issue the user token and revoke that guest token atomically; no list/layout merge. Invalid supplied bearer returns `401 UNAUTHENTICATED`. Registered bearer on login is rejected with `409 ALREADY_REGISTERED`; use logout first.
- Login revokes only the replaced guest token, not other devices' registered tokens. Guest lists remain server-side but are not restored. Public login is allowed from onboarding without creating a guest first.
- Logout revokes current registered token; other device sessions remain active. Client clears its account cache/notifications and calls guest provisioning online. A repeated logout yielding 401 is treated by the client as already logged out. Guest provisioning always creates fresh identity even for a previously used device_id; first_device is not unique across abandoned accounts.
- Pending local actions must sync or be explicitly discarded before registration/login/logout; server cannot inspect the mobile outbox. Do not send a pending list layout from one account into another account.
- Email verification uses an emailed six-digit string code, including leading zeros, expires after 10 minutes, and is single-use. Resending invalidates the prior code. Five failed confirmations invalidate the code; request allows one send per 60 seconds/account. Request also limits email sends to five/hour/account; confirmation/login/provisioning/register are limited to 20 requests/minute/IP, with confirmation additionally limited to five/minute/account. Return 429 and Retry-After when exceeded. Do not expose codes in the API; demo reads development mail inbox.
- Registration does not send email automatically. App requests verification when receiving a share or through the pending-share screen. Unverified users can CRUD their own lists and send shares; recipients must verify before acceptance/access. No reset, social auth, account deletion or restoration route.

## 4. CRUD

All mutations in sections 4–6 require `Idempotency-Key: UUID`, a stable key for that exact request. Missing/invalid key returns 422. This remains necessary to prevent a lost-response retry from creating duplicate lists/todos/copies. Retry behavior is in section 8.

### Lists

| Method / path | Body/query | Success / access |
| --- | --- | --- |
| GET, HEAD `/api/todo-lists` | None | 200 List[]; all accessible lists |
| POST `/api/todo-lists` | `{id, name, description?, icon?, color?}` | 201 List; owned by caller |
| GET, HEAD `/api/todo-lists/{todo_list_id}` | None | 200 List with todos; owner/accepted member |
| PATCH `/api/todo-lists/{todo_list_id}` | Any nonempty subset of `{name, description, icon, color}` | 200 List; owner |
| PUT `/api/todo-lists/{todo_list_id}` | `{name, description, icon, color}` all required | 200 List; owner |
| DELETE `/api/todo-lists/{todo_list_id}` | None | 204; owner; hard cascade delete todos/shares/layout references |

List name trims outer whitespace, 1–120 characters. Description null or string up to 2,000 characters; preserve whitespace. Icon enum: droplet|home|briefcase|book|heart|cart|star|check, default droplet. Color #RRGGBB, normalized uppercase; default #22C55E. Create defaults description=null. PATCH leaves omitted fields unchanged; null clears nullable description. PUT is full replacement of editable fields.

No list version/base_version/change wrapper. Updates are last-write-wins for submitted fields. UI confirms nonempty-list deletion; server deletes all todos currently in the list, including arrivals since it was viewed. Deleted/inaccessible list returns 404; repeated DELETE without matching receipt also returns 404.

The first list ever created by an account auto-adds to list_view_layout. Later creates do not. Removing all sections does not reset the first-list marker. Local first-list overlay is provisional until server acknowledgment/snapshot.

### Todos

| Method / path | Body/query | Success / access |
| --- | --- | --- |
| GET, HEAD `/api/todos` | Optional todo_list_id=UUID and is_done=true|false | 200 Todo[]; accessible filtered todos |
| POST `/api/todos` | `{id, todo_list_id, name, description?, is_done?, deadline?}` | 201 Todo; owner/accepted member |
| GET, HEAD `/api/todos/{todo_id}` | None | 200 Todo; owner/accepted member |
| PATCH `/api/todos/{todo_id}` | Nonempty subset of `{name, description, is_done, deadline}` | 200 Todo; owner/accepted member |
| PUT `/api/todos/{todo_id}` | `{name, description, is_done, deadline}` all required | 200 Todo; owner/accepted member |
| DELETE `/api/todos/{todo_id}` | None | 204; owner/accepted member; hard delete |

Todo name trims outer whitespace, 1–200 characters; description null or string up to 5,000 characters. Defaults description=null, is_done=false, deadline=null. Past deadlines allowed. PATCH omitted fields unchanged; null clears nullable fields. Boolean false explicitly uncompletes. PUT replaces all four editable fields. Neither update accepts a version, base values, full local-state wrapper or parent-list reassignment.

PATCH example:

```json
{
  "name": "Submit final",
  "is_done": true
}
```

Server applies submitted fields without conflict comparison; return updated Todo. If actual normalized state changes, atomically increment todo.version by 1 and updated_at; otherwise preserve both. Server never creates a copy from PATCH/PUT. Missing todo returns 404. POST into inaccessible/missing parent also returns 404. ID collision with an existing record returns 409 ID_ALREADY_EXISTS, except an exact request replay. Hard deletion removes the row; no permanent used-ID registry. Clients always create fresh UUIDs except exact request retries.

Queries accept exact string true/false. Unknown/inaccessible todo_list_id filter returns 404 rather than empty data. No filters returns all accessible todos.

## 5. Settings

| Method / path | Body | Success |
| --- | --- | --- |
| GET, HEAD `/api/settings` | None | 200 `{data: {list_view_layout: UUID[]}}` |
| PATCH `/api/settings` | `{list_view_layout: UUID[]}` | 200 same shape |

Each account accesses only its settings. Array replaces layout, preserves order, is duplicate-free, and may be empty. Each ID must be a currently accessible persisted list; invalid refs produce 422 under list_view_layout. No settings version/base_version or optimistic-lock errors; last submitted layout wins. Submit provisional unsynced list IDs only after their creates succeed. No settings-by-user/PUT/DELETE route. List deletion/revocation/leave removes references server-side.

## 6. Sharing

Registered owner required; an unverified owner may send shares. Verified matching recipient required to accept shared access. Arrays list_ids/pending_shares are server-managed indexes, never client-writeable proof of access.

| Method / path | Body | Success / access |
| --- | --- | --- |
| GET, HEAD `/api/todo-lists/{todo_list_id}/shares` | None | 200 Share[]; registered owner |
| POST `/api/todo-lists/{todo_list_id}/shares` | `{email}` | 201 new pending Share; 200 existing active Share; owner |
| DELETE `/api/todo-lists/{todo_list_id}/shares/{share_id}` | None | 204; owner; physically remove share |
| GET, HEAD `/api/shares/pending` | None | 200 own pending Share[]; registered, may be unverified |
| POST `/api/shares/{share_id}/accept` | None | 200 List; verified matching recipient |
| POST `/api/shares/{share_id}/decline` | None | 204; matching registered pending recipient; remove share |
| POST `/api/todo-lists/{todo_list_id}/leave` | None | 204; accepted registered member; remove share |

Normalize email identically to auth; owner's own email is 422. One active share per list/email. Existing pending/accepted share returned unchanged on POST even with a different operation key. Unknown recipient emails are allowed. No invitation email beyond verification. A later share after removal gets a new share ID and pending status.

Acceptance adds list to recipient list_ids/removes pending_shares transactionally; reaccepting a still-existing accepted share returns 200 List. Decline of an accepted share returns 409 SHARE_NOT_PENDING; use leave. Owner leave returns 409 OWNER_CANNOT_LEAVE. Removed or unauthorized share returns 404; no historical membership lookup. Known accepted-member leave is 204; subsequent leave without matching receipt is 404. There is no ownership transfer.

Revoke/leave/delete immediately removes access and layout/index refs server-side. Local cache/reminders are removed on next successful snapshot; disconnected devices cannot be remotely erased. Ownership/access is checked server-side on every request, independently of client arrays. Readable list with wrong role returns 403 OWNER_REQUIRED; otherwise inaccessible IDs are hidden by 404.

## 7. Device-owned offline reconciliation

### GET, HEAD `/api/sync/snapshot`

Any bearer. 200 `{data: Snapshot}` containing server_time, session (section 2), todo_lists (List[] without nested todos), todos (Todo[]), pending_shares (own pending Share[], empty for guest). Read from one consistent database view; no pagination/delta cursor.

```json
{
  "data": {
    "server_time": "2026-10-02T04:00:00.000Z",
    "session": {
      "account": {
        "id": "11111111-1111-4111-8111-111111111111",
        "kind": "guest",
        "user_id": null,
        "first_device": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      },
      "user": null,
      "settings": {"list_view_layout": []}
    },
    "todo_lists": [],
    "todos": [],
    "pending_shares": []
  }
}
```

This is the **one GET at reconnect for comparison**. Server returns current state; it does not compute or return server_changes because it does not have the device's base cache. Device computes server_changes, stores the result for this replay cycle, and runs CRUD requests. No POST /api/sync, batch operations, server merge/copy endpoint, tombstones or precondition parameters.

### Local data

Device persists synchronized base snapshot B separately from queued local_changes and derived view. Do not increment cached server todo.version when applying local overlays: it must remain the last acknowledged server revision. Local intended result is derived from cached state plus actions. Preserve local deleted-todo data until deletion acknowledges, to allow device confirmation/recovery. This is local pending work, not a server deletion marker.

### One-time comparison and replay

1. Before replacing B, obtain snapshot S. Compute on device:
   - For every todo.id present in B and S: differing todo.version means ID is in server_changes.
   - For every todo.id present in B but absent in S: also put ID in server_changes and missing_todos. Deletion cannot increment a version because the row is gone.
   - New server-only todos are included in the refreshed base but have no conflicting cached edit. Locally unsynchronized creates are not in B and are not falsely classified as server-deleted.
   - A cached list absent in S is unavailable. Do not infer whether it was deleted or access was revoked.
2. Keep server_changes fixed for this cycle. Coalesce each locally edited existing todo to one changed-field PATCH and a complete local intended result for possible POST. New todo edits fold into its create; new creates cancelled before sending generate no request.
3. Replay local list creates first with their stable IDs/keys, then dependent todo creates. Failure of a parent create blocks its children; retain local error/work. Offline persisted-list editing/deletion/sharing remains unsupported.
4. For an existing todo with queued edit/completion: if its ID is in server_changes, POST an ordinary new todo into the same accessible list using a fresh persisted UUID, full local intended fields and new persisted operation key. If not in server_changes, PATCH only changed fields to existing ID. No base/cache values sent to server.
5. New local todo creates always POST. For a missing original with a queued edit, copy via POST only if the parent list remains accessible. Do not recreate unavailable parent lists. Retain rejected work and show “List no longer available” at reconnect and next session entry.
6. **Deletion exception preserves the earlier agreed policy:** if local action is delete and server todo is unchanged, DELETE it. If server version changed, prompt on device before DELETE; no conflict copy for a delete. If todo is already absent but its list remains accessible, acknowledge local deletion without a request. If list is unavailable, show the list error and retain work until explicit discard. Server performs no revision check on confirmed DELETE.
7. Persist each request's method/path/body/key and any new copy ID before sending. Queue acknowledgment/cache update is atomic locally. Exact retry never allocates another copy. Freeze a sent payload; subsequent local edits become new queue work.
8. Use S as refreshed base plus acknowledged CRUD resource responses. Never discard remaining queued overlays. On errors keep pending work; independent lists may continue. A later foreground/manual refresh may fetch another snapshot to refresh content; do not recompute this cycle's comparison after each write.

The new revision-only rule deliberately supersedes previous field-wise merging: **even identical edits or edits to unrelated fields produce a copy if todo.version changed**. Copies keep local fields/name/deadline and are marked only in local UI metadata; that marker need not synchronize across devices. A copied todo is just a normal todo on the server.

### One-time comparison limitations — accepted simplicity

The GET and subsequent writes are separate requests. A remote write after S can be overwritten by a later PATCH/PUT, and a remote edit can be removed by a later DELETE. This contract has no second comparison, conditional write, server-side merge or database-wide lock across mobile requests. Ordinary updates are last-write-wins for submitted fields. If PATCH gets 404 after comparison, refresh that parent list once to verify access; create a copy only if it remains readable, otherwise show unavailable-list error. This is missing-target recovery, not another version comparison cycle.

A network failure can leave a write committed without its acknowledgment. On reconnect, retry unresolved frozen requests with the same keys **before classifying those operations again**, so an acknowledged own write is not mistaken for a new remote conflict. Remove acknowledged operations; then perform the one snapshot comparison for remaining unsent work. Receipt retry failures remain pending and block dependent actions. This ordering is essential to prevent duplicate conflict copies across app restarts.

## 8. Retry receipts without deleted-record history

Every protected resource mutation uses Idempotency-Key scoped to account. Store method/path/normalized payload fingerprint and committed HTTP status/resource ID in a receipt atomically with the mutation. Receipts do not retain todo/list bodies, old versions or deleted-resource rows and are not used to compute changes. Keep receipts for the demo lifetime. They are operation retry records, not deletion markers.

- Same key, different method/path/payload gives 409 IDEMPOTENCY_KEY_REUSED. Same committed request never reexecutes or increments todo revision. Failed requests do not create committed receipts.
- For a repeated resource-returning mutation, check current access and return its current resource with the original success status. If resource was since deleted/inaccessible, return 404 without reapplying/recreating it. A receipt's presence prevents repeating a deleted create even when its row is gone.
- Exact replay of a committed no-body delete/decline/revoke/leave returns the original 204 to that same account, without consulting deleted history or leaking content. A different key for an absent resource returns 404.
- When a previously sent create/update returns 404 on recovery, stop that frozen operation and mark its target unavailable; do not issue the same intent with a new ID/key automatically. Inspect the fresh snapshot for missing list/todo, show recovery/discard, and avoid resurrecting data deleted after the original success.
- List/todo/share deletion physically removes rows/JSON entries. No soft-delete column, deleted_at, version history, removed-ID registry or retained tombstone. No distinction between deleted and never-existent IDs in ordinary lookups.
- Registration keeps account ID/receipts; login to another account replaces scope. Never replay old guest requests under the registered user's account.

## 9. Endpoint review and exclusions

Retained: example CRUD routes and their HEAD/PUT/PATCH support; guest/register/login/me/logout; verification request/confirm; own settings; email sharing/pending/accept/decline/leave; one snapshot GET.

Simplified: flat PATCH/PUT bodies, empty DELETE bodies, no list/settings revision, no mutation meta/conflict marker, no compare payload sent to server, no server conflict responses, no historical share lookup, and no POST sync endpoint. Authentication/verification remain because guests and verified-email sharing are still agreed features; not added production scope.

Excluded: API version migration/backward compatibility, server reminder/push scheduling, delta cursor, pagination, todo moves, bulk delete, ownership transfer, email change, account restoration, password reset and AI capture. Home derives from snapshot/settings. Sharing/auth/settings writes are online; unsynchronized Home layout may be previewed locally and submitted after list creation.
