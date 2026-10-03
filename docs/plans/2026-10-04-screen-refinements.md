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
- [x] Reproduce callback-style loss through the installed navigation Slot.
- [x] Make card styles objects; add a reusable accessible header PlusButton and wire the existing create sheet.
- [x] Verify styling regression, client tests, lint and typecheck; commit Lists files only.

### 2. List detail
- [x] Add HTTP tests proving completion timestamps, unchanged completion retries, unrelated edits, reopening and server-owned validation.
- [x] Add migration, resource/cast/controller fields; update the v1 contract and local database. Run API tests and Pint; commit this API task separately.
- [x] Extend the todo parser and test sorting across deadlines, creation/completion dates and invalid data.
- [x] Build native TodoList and right-accessory TodoRow; grey completed rows and place create action in header. Run client checks; commit detail and shared todo components.

### 3. Home
- [x] Reuse TodoList while keeping direct screen queries and Outstanding-only sections; retain Pin Lists sheet.
- [x] Run client checks and commit Home.

### 4. Settings
- [x] Render account as the first row and guest Sign In as a separate Section; retain sign-up flow and account query errors.
- [x] Run auth tests, lint/typecheck and build validation; commit Settings/auth.

### 5. Final verification
- [x] Review section diffs against this checklist; run full affected suites and confirm Git status.

## Execution record

- Lists: `68ce410`. Reproduced style loss through navigation Slot; object styles preserve background and sizing. Browser confirms title/color/header Plus.
- API completion timestamps: `8561c1f`. Migration applied locally. HTTP transition/retry/edit/reopen tests pass; API remains v1.
- Detail: `87f2df2`. Native TodoList, right completion control, chronological completion sorting and header Plus. Parser/sorting tests pass.
- Home: `1ef8925`. Same native presentation; completed todos excluded from both Outstanding and pins. Browser confirmed seeded completed todo is absent.
- Settings: `8ff316f`. Identity row and separate auth Section, Sign Up flow, plus PRD Sign Out lifecycle with cache resets and guest provisioning failure coverage. Restored the onboarding navigation type required by existing callers.
- Verification: 20 client tests; client lint/typecheck; 15 API tests and Pint; iOS and Android exports. Physical-device layout has not been visually verified.
- Ruling: implement registered Sign Out in the Settings section — required by the reread PRD, and showing guest-only Sign In to a registered account would fail API authorization.
- Final review found failed authentication could strand a canceled retained detail query. Fixed in `e3b4b8e`; real QueryClient/QueryObserver regression failed before the fix, passes after it, and targeted reviewer verification found no remaining issue.
