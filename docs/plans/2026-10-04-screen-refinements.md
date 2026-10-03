# Screen refinements implementation plan

> Execute sequentially on main, as requested. Commit each app section separately.

**Goal:** Correct Lists rendering and align list detail, Home, and Settings with the PRD and October 4 instructions.

**Architecture:** Screens keep direct TanStack queries and compose feature components. A shared native Expo UI TodoList renders sections; Laravel supplies a server-owned completion timestamp.

**Tech stack:** Expo SDK 57, Expo UI, Expo Router, TanStack Query, Laravel 13, SQLite.

**Spec:** `docs/plans/2026-10-02-eves-mvp-prd.md` plus October 4 screen instructions.

## Constraints and rulings

- API remains v1; todo.version remains an independent data revision.
- Detail ordering: incomplete first, deadline ascending (undated last), creation descending; completed ordered chronologically by completion time, oldest first.
- Home retains PRD Outstanding ordering (deadline then oldest creation) and outstanding-only pinned sections. Shared presentation does not change that requirement.
- completed_at is server-owned, cleared on reopening and preserved during unrelated edits. Historical completed rows are backfilled from updated_at because earlier completion times were not recorded.
- Preserve existing work; no push. Prior unfinished changes belong to the relevant section commits.

## Review focus

- Navigation wrappers must preserve card styles and visible names.
- Todo sorting must handle equal/missing deadlines without mutating query data.
- Completion retries and title edits must not change completion chronology.
- Home must exclude completed todos, including pinned sections.
- Guest versus registered accounts must show the correct identity and avoid offering guest-only sign-in for registered sessions.

## Tasks

### 1. Lists
- [ ] Reproduce callback-style loss through the installed navigation Slot.
- [ ] Make card styles objects; add a reusable accessible header PlusButton and wire the existing create sheet.
- [ ] Verify styling regression, client tests, lint and typecheck; commit Lists files only.

### 2. List detail
- [ ] Add HTTP tests proving completion timestamps, unchanged completion retries, unrelated edits, reopening and server-owned validation.
- [ ] Add migration, resource/cast/controller fields; update the v1 contract and local database. Run API tests and Pint; commit this API task separately.
- [ ] Extend the todo parser and test sorting across deadlines, creation/completion dates and invalid data.
- [ ] Build native TodoList and right-accessory TodoRow; grey completed rows and place create action in header. Run client checks; commit detail and shared todo components.

### 3. Home
- [ ] Reuse TodoList while keeping direct screen queries and Outstanding-only sections; retain Pin Lists sheet.
- [ ] Run client checks and commit Home.

### 4. Settings
- [ ] Render account as the first row and guest Sign In as a separate Section; retain sign-up flow and account query errors.
- [ ] Run auth tests, lint/typecheck and build validation; commit Settings/auth.

### 5. Final verification
- [ ] Review section diffs against this checklist; run full affected suites and confirm Git status.
