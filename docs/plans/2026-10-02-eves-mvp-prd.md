# Eves MVP — Product Requirements

Date: 2026-10-02
Status: Implementation in progress; API contract stays v1 throughout MVP. Screen refinements confirmed October 4, 2026.

## Purpose and scope

A minimal CRUD assignment app for iOS and Android, using React Native/Expo, Expo Router, Expo UI, and Laravel. No production launch, market validation, ambient conversation capture, AI integration, gluestack, or avatar generation. Attractive onboarding may use the requested aspirational copy despite capture being outside the functional demo.

The app supports multiple lists, todo CRUD, guest/device accounts, registered sign-in, shared lists, offline actions with reconciliation, and local deadline reminders. These agreed features are the scope; “minimal” does not silently remove sharing or offline behavior.

## Screens

### Onboarding

Show once per installation, with “Create first list” primary and “Sign in” secondary. Preserve copy:

> Todo reimagined.
>
> Eves listens to your conversations and drops Todos in your Lists.
>
> Begin by creating a List. Lists should be organised by areas in your life so that Eves can organise your Todos accurately.

Initial guest provisioning requires connectivity. Later cached use works offline. Empty states retain Create first list. The green water-drop avatar is deferred.

### Home — center tab, position 2, initial main tab

Outstanding shows uncompleted todos from all accessible lists. Dated todos come first, earliest deadline first, including overdue todos; undated todos follow, oldest creation first. Use creation time and ID for deterministic ties.

Below Outstanding, show selected list sections containing outstanding todos. A Pin icon at the top right of the native large Home header pushes a Stack formSheet with the shared colorful list grid. It displays every accessible list, with existing pins checked. Saving keeps selected existing pins in their previous order, appends newly selected lists, and removes unchecked pins; an empty selection clears all pinned sections. Account-scoped user_settings.list_view_layout is an ordered JSON list of list IDs. Automatically add the first created list; subsequent sections are explicitly selected. Support selecting an existing list, creating a new list, removing a section, and reordering sections. A todo may intentionally appear in Outstanding and its selected list section. Remove inaccessible/deleted list references when learned during sync.

### Lists — tab position 1

Grid displays accessible list names and white icons directly on each card’s list color. A Plus button in the top-right navigation header opens list creation. Create List uses a native, non-scrolling FieldGroup for name, optional description, icon dropdown, and color picker, followed by a full-width submit button. Long press offers Rename, Share and Delete. Rename edits name and optional description; Share creates email invitations and allows revocation; Delete uses a native AlertDialog confirmation. List detail offers Share and a menu for Rename/Delete, and its header uses the same gradient as the grid card. Open list detail to view todos, add/edit todos, toggle completion, and delete todos. Completed todos remain available in list detail but are excluded from Home outstanding sections. Detail uses a native Expo UI List with a right-aligned completion control: an empty circle when incomplete and checkmark.circle.fill when complete. Tapping the checkbox toggles is_done once. Tapping todo text opens description editing; swiping reveals Delete on native platforms. New todos default to is_done=false. Create Todo pushes a Stack formSheet with the same section-free FieldGroup style and an optional deadline date/time picker. The top-right header Plus opens todo creation. Incomplete todos appear first, sorted by deadline ascending (undated last), then created_at descending, then ID. Completed todos are grey and follow, sorted by server-owned completed_at ascending, then ID. Reopening clears completed_at; subsequent completion records a new time, while unrelated edits preserve it. The creation/edit form supports name, optional description and optional exact deadline. Home reuses the same extended List presentation, retaining its own Outstanding ordering and completed-todo exclusion.

Owner may edit list name/description/icon/color online, delete lists online, and manage sharing. Confirm deletion of a nonempty list; deleting it removes its todos. Members may manage todos and leave; no ownership transfer. List creation is allowed offline; cancelling an unsynchronized list removes its creation and dependent todo actions.

Pending shares appear under Lists with accept/decline. Owner can revoke pending or accepted access. Sharing does not require the recipient to already exist. Guests cannot share.

### Settings — tab position 3

The first native List item shows “Guest Account” for guests or the registered email. Authentication actions are in a separate Section below: guests see Sign In; registered users see Sign Out. Sign In and Sign Up push Stack formSheets using the shared form style: labels left, fields/placeholders right, no introductory supporting text, and full-width primary and Cancel buttons. The account-switch links have no underline. The shared button forwards native Button props and uses glassProminent for primary actions and glass for Cancel on iOS. Before account switching or sign-out, synchronize pending edits or require explicit discard. Clear outgoing account cache and scheduled reminders. Sign-out creates a fresh device-bound guest account; the MVP does not restore previous guest accounts. First provisioning of that new account requires connectivity, consistent with the first-launch rule. Onboarding does not repeat.

## Accounts and authentication

Laravel provides the server API and authorization. Sanctum provides bearer-token infrastructure; guest creation and account transitions are application-specific. A first_device identifier is metadata, not a credential; retain a server-issued guest secret/token securely. See [Sanctum mobile authentication](https://laravel.com/framework/docs/13.x/sanctum#mobile-application-authentication).

Confirmed authentication: email and password; email is the login identifier, with no separate username field. Registration is reachable from Sign in. Email verification is required before receiving shared access. Skip social login, password recovery and account deletion for this assignment. Registered users can use multiple devices; guest recovery after reinstall is not guaranteed.

Account invariant: exactly one of first_device or user_id is non-null. Registering the current guest converts its account to a registered account, retaining its lists and clearing first_device. Signing into an existing registered identity replaces the active account without merging guest lists. Abandoned guest data is retained server-side, while its local cache/credentials are cleared; warn before switching because previous guest access is not restored in this MVP.

After sign-out, clear registered credentials, cached data and reminders, then provision a fresh guest account using the installation identifier. No account restoration is required. Reuse the installation identifier as metadata for the new active guest account; do not authenticate solely from that identifier. Account transitions synchronize pending changes first or require explicit discard. If connectivity prevents new guest provisioning, show a retry state rather than expose the outgoing registered account's data.

## Conceptual schema

This defines product entities. The [frozen API contract v1](2026-10-02-eves-api-contract-v1.md) governs wire fields, UUIDs, endpoints and synchronization; physical migrations remain implementation work.

| Entity | Fields and invariants |
| --- | --- |
| users | id, unique email, password hash, email_verified_at; list_ids and pending_shares JSON arrays |
| accounts | id, nullable user_id, nullable first_device; exactly one non-null; one registered account per user |
| user_settings | account_id, list_view_layout JSON array of list IDs |
| todo_lists | id, owner_account_id, name, optional description, icon, color, shared_emails JSON, timestamps |
| todos | id, todo_list_id, name, optional description, is_done boolean, optional deadline, nullable server-owned completed_at, timestamps; server-owned version revision for device comparison |
| mutation receipts | account-scoped request key/fingerprint, success status and resource ID; retries do not retain deleted-resource bodies or version history |

Use outstanding/completed as UI labels derived from is_done; avoid storing an independent status that can disagree. User list IDs are discovery indexes, never proof of access. pending_shares contains list ID and sharing user; reconcile it when recipients register/sign in. Account-scoped settings support guest layouts and registered cross-device layout sync.

Server authorization checks owner or accepted email access for every list/todo read and write. Allowed emails plus accepted user list IDs determine shared access; pending recipients cannot read a list before acceptance. Keep sharing arrays consistent in server transactions, including decline, leaving, revocation and deletion. No invitation email is required beyond the verification workflow if email verification remains in scope.

## Offline storage and synchronization

- Persist the synchronized base snapshot separately from local actions. Render the snapshot with those actions applied; local overlays do not alter the cached server todo.version.
- Offline todo create/edit/complete/delete and list creation/cancellation are supported. Persisted-list editing/deletion and sharing require connectivity.
- At reconnect GET /api/sync/snapshot once, then compare cached and server todo.version on the device to build server_changes (todo IDs). Cached todos missing from the snapshot are also changed/missing; no server tombstones are needed.
- Coalesce queued edits per todo. If its ID is in server_changes, POST a new todo containing the locally intended result and preserve server todo; otherwise PATCH changed fields on the existing todo. Copies use fresh client UUIDs and ordinary create payloads. The server neither compares local state nor creates conflict copies.
- This supersedes earlier field-level merging: identical/unrelated edits also copy if the server todo revision changed. API version remains v1; todo.version is a separate data revision that increments on actual server edits.
- For queued deletion, preserve the earlier exception: changed live todo prompts on-device confirmation before DELETE; already missing todo in an accessible list acknowledges deletion locally. Do not create a copy of a delete action.
- If parent list is absent/inaccessible, block its actions, retain a recovery summary, and show an unavailable-list error immediately and again at next session entry. Deleted versus revoked is not distinguished without history.
- Create parent lists before dependent todos. Use client-generated UUIDs without integer mapping. Persist request keys and copy IDs before sending; exact retry never allocates a second copy. Recover unacknowledged frozen requests before reclassifying unsent operations at a new reconnect.
- Synchronize after mutations, reconnect, foreground and manual refresh. No background/socket guarantee. After initial comparison, update cache from the snapshot and acknowledged CRUD responses while retaining pending overlays.
- No batch POST sync, base-values/local-state wire fields, server merge/precondition rules, soft deletes or retained deletion markers. Delete means hard deletion. Receipts retain operation metadata only for retry protection.
- Accepted demo limitation: one comparison does not protect against a remote write arriving between snapshot and PATCH/DELETE. Server writes are last-write-wins for submitted fields. API contract defines missing-target recovery and partial network-failure handling.

## Deadline reminders

Optional exact date/time deadlines, displayed in device-local timezone and stored as UTC instants. Schedule a local reminder one day before each cached outstanding todo deadline on each member's device. Skip retrospective reminders if that trigger is already past.

Cancel/reschedule on edit, completion, deletion and synchronization. Cancel outgoing account notifications on sign-out and known revoked access. Permission denial leaves CRUD usable and provides concise guidance. Offline devices cannot learn remote changes immediately; reminders can therefore be stale. Do not promise exact OS notification delivery. Notification IDs are scoped to account/device/todo, including conflict copies.

## Laravel API baseline

The user supplied the following as examples, not an exhaustive/frozen contract. Preserve these resource routes as the CRUD baseline:

| Methods | Path | Behavior |
| --- | --- | --- |
| GET, HEAD | /api/todo-lists | List accessible lists |
| POST | /api/todo-lists | Create an owned list |
| GET, HEAD | /api/todo-lists/{todo_list_id} | Fetch accessible list and its todos |
| PUT, PATCH | /api/todo-lists/{todo_list_id} | Owner updates list |
| DELETE | /api/todo-lists/{todo_list_id} | Owner deletes list and todos |
| GET, HEAD | /api/todos | List accessible todos; optional list filtering |
| POST | /api/todos | Create todo in accessible list |
| GET, HEAD | /api/todos/{todo_id} | Fetch accessible todo |
| PUT, PATCH | /api/todos/{todo_id} | Update accessible todo |
| DELETE | /api/todos/{todo_id} | Delete accessible todo |

HEAD follows GET authorization/status semantics and returns no body. The [frozen API contract v1](2026-10-02-eves-api-contract-v1.md) adds guest/auth, email verification, settings, sharing and full-snapshot synchronization routes and defines all request/response shapes.

Example resource fields supplied by user:

- Todo List: id, name, created_at, updated_at, todos (nested todo resources).
- Todo Item: id, description, is_done, todo_list_id, created_at, updated_at.

Extend these examples for the agreed list description/icon/color and todo name/deadline. Use todo_list_id consistently in the API. is_done represents status. Numeric example IDs do not forbid client-generated local identifiers; API v1 freezes UUID v4 strings for resource IDs. Prefer UTC ISO 8601 timestamps over ambiguous example timestamp strings. Offline replay uses ordinary CRUD routes; comparison/copy decisions belong to the device. API remains fixed at v1 throughout MVP, without compatibility/migration work.

## Stack

Confirmed UI choice: Expo UI, not gluestack. Use React Native for screen layouts and virtualized task collections, with Expo UI native controls and platform-specific adapters where required. Existing Expo SDK 57 / React Native / TypeScript / Expo Router remain the foundation. Expo UI platform capabilities are recorded in [stack research](2026-10-02-eves-tech-stack-research.md).

Accepted supporting recommendation: local Expo SQLite snapshot/outbox, SecureStore credentials, Network reconnect hints and local Notifications; Laravel/Sanctum with persistent server SQLite for the assignment. No production hosting or submission constraint was supplied. No dependencies have been installed or runtime compatibility tested during this PRD work.

## Acceptance criteria

1. iOS and Android provide guest first-list creation, persistent CRUD, and once-per-install onboarding.
2. Email/password sign-in follows the defined account lifecycle without silently merging guest data; account switching never leaks another account's cache.
3. Home sorting/layout and Lists/detail controls follow this PRD.
4. Registered owners share with recipients who may not yet exist; acceptance/revocation/leave enforce server permissions; guests cannot share.
5. Offline list creation and todo actions survive restart and synchronize once; retry does not duplicate records or conflict copies.
6. On-device revision comparison routes queued updates to PATCH or POST-copy; changed-todo deletion prompts on-device confirmation; unavailable lists produce recoverable errors. One-time comparison race limitations are documented.
7. One-day local reminders are scheduled/cancelled from cached state and permission denial leaves CRUD usable.
8. The ten example resource routes provide authorized CRUD and HEAD behavior; additional agreed workflows have API coverage.
9. Conversation capture, AI processing and avatar creation remain outside the functional MVP.

## Final decision record and review

The user settled all discovery questions. Final clarifications: no guest-account restoration for MVP; authentication uses email and password. Expo UI is selected; gluestack is excluded. The API examples are illustrative and permit extensions required by the agreed features.

This PRD records the completed discovery. Review this written version before implementation planning. The API contract v1 has been revised at the user's request: API stays v1; reconciliation is device-side; resource deletion is hard deletion without retained deletion history. No application code, dependencies, migrations or API endpoints have been implemented as part of this document task.
