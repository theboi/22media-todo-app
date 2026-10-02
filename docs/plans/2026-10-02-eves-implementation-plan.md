# Eves MVP Implementation Plan

> **For agentic workers:** Use executing-plans task by task; independent backend and UI domains may use dispatching-parallel-agents. Track checkboxes and the execution ledger. User explicitly requested writing this plan and executing it in the same request.

**Goal:** Deliver the agreed iOS/Android todo MVP with a Laravel API and Expo UI client.

**Architecture:** Laravel owns bearer accounts, authorized CRUD, sharing, verification, retry receipts and consistent snapshots. The client persists a base snapshot and local actions in SQLite, decides conflicts from todo revisions once per reconnect, and replays ordinary CRUD. Expo Router screens consume one application facade; native credentials use SecureStore and local reminders use Expo Notifications.

**Tech Stack:** Existing Expo SDK 57, React Native, TypeScript, Expo Router, Expo UI; Expo SQLite/SecureStore/Network/Notifications/Crypto; Laravel with Sanctum, SQLite and PHPUnit.

**Spec:** [PRD](2026-10-02-eves-mvp-prd.md) and [fixed v1 API contract](2026-10-02-eves-api-contract-v1.md).

## Global Constraints

- API stays v1; only todo.version increments on actual editable-data changes.
- Client PATCH sends changed fields only; no server merge, base_values, local_state, batch sync or tombstones.
- Guest account has first_device XOR user_id. Register converts guest; existing login replaces account, no merge/restoration; sign-out provisions fresh guest.
- Native UI uses Expo UI universal controls and React Native layout/virtualization. Preserve inline semantic styling, feature boundaries and safe-area handling.
- Require online first provisioning, sharing, list editing/deletion and settings persistence. List creation/cancellation and all todo mutations work offline.
- Email verification required to accept shares; no invitation emails, production deployment, password recovery or AI capture.
- Preserve pre-existing AGENTS.md changes. Work on codex/eves-mvp in this checkout; do not push/merge/deploy.

## Review Focus

1. Lost-response create/copy retries must preserve request key and ID through restart; owning task: 4.
2. Reconnect must compare against original base before replacing it; own acknowledgments must not be classified as remote conflicts; task: 4.
3. Cross-account reads/writes and revoked share access must never leak cached/API data; tasks: 2 and 5.
4. Hard deletion followed by retry must not resurrect records; tasks: 3 and 4.
5. Offline drafts/dependent actions and stale reminders survive/reconcile without disappearing silently; tasks: 4 and 6.

## File boundaries and public interfaces

- Backend worker owns only todo-app-api/, including scaffolding, migrations, models, Form Requests, policies, API Resources, actions, controllers, middleware, routes and feature tests.
- Client domain implementer owns src/lib/api/{types,client,config}.ts, src/features/app/{types,selectors,reconcile,storage,notifications,provider}.ts(x), client package/config and tests.
- UI worker owns src/app/, src/components/ui/, src/features/{onboarding,auth,lists,todos,settings,home}/ and src/hooks/use-theme.ts. No package edits or domain/provider implementation.
- API types: TodoList {id,name,description,icon,color,owner_account_id,role,created_at,updated_at}; Todo {id,todo_list_id,name,description,is_done,deadline,version,created_at,updated_at}; Settings {list_view_layout:string[]}; Session {account,user,settings}; Share and Snapshot match contract exactly.
- App facade exported by src/features/app/provider.tsx: AppProvider, useApp(). Fields: ready,busy,syncing,online,error,session,onboardingDone,snapshot,view,pendingCount,permissionNotice,layout. Methods: completeOnboarding(),ensureGuest(),login(email,password),register(email,password,confirmation),logout(discard?),refresh(),clearError(),saveList(input,id?),deleteList(id),saveTodo(input,id?),toggleTodo(todo),deleteTodo(todo,confirmed?),setLayout(ids),shareList(id,email),getShares(id),acceptShare(id),declineShare(id),leaveList(id),requestVerification(),confirmVerification(code),discardPending(). Methods return promises; errors reject and are presented through global error state. view has todo_lists/todos; pending shares are snapshot.pending_shares.
- Input types exported in src/lib/api/types.ts: ListInput {name,description,icon,color}; TodoInput {todo_list_id,name,description,is_done,deadline}. No generated/runtime mode branching inside UI.

### Task 1: Runtime and testable scaffolds

**Files:** todo-app-api/composer.json, bootstrap/app.php, config/*; todo-app-client/package.json, app.json, eslint.config.js; src/lib/api/types.ts; docs/plans/2026-10-02-eves-execution-ledger.md.
**Interfaces:** Produces Laravel/Sanctum runtime, API types and test/lint/typecheck commands.
- [x] Install missing PHP/Composer and create Laravel scaffold without overwriting backend AGENTS.md; install Sanctum and initialize durable SQLite.
- [x] Add SDK-compatible Expo persistence/network/notification/crypto dependencies using expo install; add TypeScript node-test runner and lint configuration.
- [x] Run generated Laravel baseline tests and client typecheck before behavior changes. Read matching installed-version Laravel docs and SDK57 docs.
- [x] Record runtime versions, initial failures and rulings in ledger.

### Task 2: Guest/authentication and strict API boundaries

**Files:** app/Models/{Account,User}.php, app/Http/{Controllers/AuthController,Requests/*,Resources/*,Middleware/*}.php, app/Actions/Auth/*, routes/api.php, tests/Feature/AuthTest.php.
**Interfaces:** Consumes runtime; produces authenticated account-scoped Session and frozen auth routes.
- [x] Write HTTP tests for guest provisioning, XOR account identity, register retaining lists, login without merge, bad credentials, exact field validation, case-normalized email, sign-out and verified-email share requirement; run to observe missing routes fail.
- [x] Implement schema, Sanctum account principal, Form Request normalization/types/unknown-field rejection, uniform errors/headers, auth transitions and verification code delivery/rate limits.
- [x] Run AuthTest and full backend suite; expected all pass with isolated SQLite and faked mail.

### Task 3: Authorized CRUD/settings/shares/snapshot and receipts

**Files:** app/Models/{TodoList,Todo,MutationReceipt}.php, app/Policies/*, app/Http/{Controllers,Requests,Resources}/*, app/Actions/{Sharing,Retry}/*, migrations/*, tests/Feature/{CrudTest,SharingTest,RetryTest}.php.
**Interfaces:** Produces all 19 endpoint paths, flat requests and exact resources for client.
- [x] Write failing HTTP tests for nested list detail, todo revision/no-op updates, HEAD body, strict null/type inputs, owner/member boundaries, unknown-email shares/accept/leave/revoke, settings references, hard cascade deletion and lost-response retry safety.
- [x] Implement scoped queries, policies/resources, short transactional multi-record operations, atomic mutation receipts, complete snapshot and hard deletion without history.
- [x] Verify operation reuse rejects changed payload; replay returns current resource or 404 after deletion, never recreates. Run full backend tests and Pint; expected green.

### Task 4: Durable client offline engine and API transport

**Files:** src/lib/api/*.ts; src/features/app/{types,selectors,reconcile,storage}.ts; co-located *.test.ts.
**Interfaces:** Consumes frozen API types; produces persistent base/action overlays and a replay engine for provider.
- [x] Write failing node tests for snapshot-vs-overlay comparison, unchanged PATCH vs changed/missing POST-copy, changed delete confirmation, unavailable parent blocking, cancelled draft list children, identical-version conflict rule, frozen retry recovery and account cache reset.
- [x] Implement typed boundary validation and safe API errors, serialized SQLite state writes, secure credential adapter, stable request IDs, one-time device comparison, receipts recovery before comparison, action coalescing and partial-failure recovery.
- [x] Run npm test and typecheck; expected all engine cases pass using real pure logic and controlled transport/persistence boundaries.

### Task 5: Expo UI workflows and app integration

**Files:** src/features/app/provider.tsx; src/app/{_layout,index,auth,list,todo,(tabs)/*}.tsx; src/components/ui/*; src/features/{onboarding,auth,home,lists,todos,settings}/*.
**Interfaces:** Consumes facade specified above, produces onboarding/create/sign-in, Lists/Home/Settings tabs, CRUD forms/sharing/inbox/layout controls.
- [x] Implement ready/empty/error states, context guard, account-scoped cache bootstrap, online attempts/foreground/manual refresh and safe async mutation errors.
- [x] Build Expo UI controls within Host, native screen layouts, list grid, virtualized todo groups, exact deadline entry, pending-share verification/acceptance, owner controls and sign-out sync/discard flow.
- [x] Verify selectors for deadline/undated ordering and selected sections; run lint/typecheck plus web export to catch route/import/native interface mistakes. Check visible flows against real API where possible.

### Task 6: Notifications, integration verification and run guide

**Files:** src/features/app/notifications.ts, client app.json/.env.example, root README.md, execution ledger.
**Interfaces:** Consumes derived accessible outstanding todos; produces one-day local reminders and repeatable demo setup.
- [x] Write failing reminder-policy tests for one-day scheduling, overdue/late trigger skipping, completion/removal/account switch cancellation and duplicate/restart stability.
- [x] Implement Expo Notifications permission/channel behavior and reconciliation; use stable IDs in the operating system scheduler and cancel stale reminders. Permission denial leaves CRUD usable.
- [x] Run backend full suite/Pint, client tests/lint/typecheck/Expo doctor/export, and real HTTP multi-user/retry smoke. Fix justified findings and rerun affected checks.
- [x] Request one independent final review against AGENTS/spec; address material findings with regression tests. Document runtime commands, device API URL, mail inbox/log access and honest device-test limits. No merge/push/deploy.

## Execution rulings

- User requested “write implementation plan then execute”; this authorizes executing this concrete plan without a separate approval stop.
- Keep the current checkout to preserve uncommitted instructions/docs; switch to codex/eves-mvp instead of creating a worktree that would omit them.
- Use independent backend and UI workers with exclusive directories; root implements client domain/integration. No worker commits shared checkout changes; final result stays reviewable as a working-tree diff.
