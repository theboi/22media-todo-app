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

## Follow-up interaction fixes

- `205f0dd`: Todo row and checkbox share a synchronous guarded toggle; newly created todos explicitly send is_done=false and render an empty circle. Create Todo now uses the shared native List form.
- `04a2ee2`: Create List uses native List sections for name/icon/color, including the eight API-supported icons. Lists now composes the shared responsive ListGrid and selectable ListCard.
- `6d2f1ce`: Home has a native Stack large-title header with a right-side Pin icon. PinListsSheet shares ListGrid/ListCard, excludes existing pins, appends selected accessible IDs, and preserves pin order. The sheet lives with the list components to avoid feature-internal imports.
- Browser reproduction: title taps did nothing before the toggle fix. Afterward, row and checkbox each changed the database revision once; a completed demo task was reopened and restored.
- Seeded Reading (Book icon, Mint color) and Read one chapter through the app to verify forms end to end. Reading was appended after the existing Weekend pin, and the picker then showed all lists already pinned. The new todo persisted with is_done=false, completed_at=null, version=1.
- Final checks: 23 client tests, typecheck, lint, and fresh iOS/Android exports passed. A targeted reviewer found no further Important/Critical issues. Physical-device gestures and large-title rendering remain unverified.

## Native forms and management follow-up

Implemented sequentially by section:

- `b40a19e`: FieldGroup inner scrolling disabled; outer forms handle overflow. Create Todo has an optional date/time deadline.
- `3e29497`: List rename/description forms, email invitations and revocation, pending invite acceptance/decline with email verification, native delete confirmation, and shared card/header gradient.
- `555fe85`: Todo text edits description, checkbox controls completion, and native swipe exposes Delete.
- `3f31100`: Pin Lists is a Stack formSheet, shows existing selections, supports unchecking/clearing all, and uses shared full-width buttons. This supersedes the earlier picker that excluded existing pins.
- `f19c65f`: Matching Sign In/Sign Up Stack forms, left labels/right fields, removed explanatory copy and link underline.

Final review repairs navigation callbacks after sheet dismissal, Android checkbox hosting, the iOS alert anchor, and fresh share retry keys after successful invitations. Browser verification found a native-only SwiftUI modifier import in the shared button; platform-specific modifier helpers remove that web runtime failure. Native glass styling and swipe gestures still need physical-device verification.

## Todo interactions, list menus and pin visibility

- `21b876f`: Shared action menus support long-press triggers and icons across platforms. Android uses local raster icon assets; iOS uses SF Symbols.
- `5350b57`: Todo name edits inline on tap; Return/blur saves a name-only PATCH with a stable retry key. Long press offers Add/Edit Description; description text no longer navigates.
- `c90b0a9`: List description has a separate header-menu action; Rename is name-only. Create Todo moves to a bottom-right circular glassProminent button on iOS, with filled fallback on Android/web. Review caught the SDK57 requirement to supply a label before systemImage renders; labelStyle(iconOnly) preserves the Plus appearance.
- `1ab8568`: Pin cards retain their list color when experimental gradients are unavailable. Browser reproduction showed loaded selectable cards with white text on a transparent background; adding the color fallback made the grid visible. No speculative layout change was needed.
- Browser verification: created Interaction Demo and a sample todo; inline rename and description save persist after reload. Clearing the selection removes the Home section; selecting and saving again restores it. The demo data remains in the browser guest account.
- Checks: 25 client tests, typecheck, lint and iOS/Android/web exports pass. Native context-menu gestures, text input focus and glass appearance require a physical-device check. Original user edits in navigation/layout and pin-form formatting remain unstaged.

## iOS todo row correction

The reported symptoms were left clipping, inactive completion controls and inactive name editing. Installed SDK57 source shows that universal ListItem wraps its contents in a SwiftUI Button, while the prior todo name and accessory crossed React Native/native host boundaries and assigned a screen-derived width. The iOS renderer now uses one native HStack, a native TextInput/ContextMenu for the name, and a separate borderless native completion Button. SwiftUI determines the field width from the section; Android/web retain their prior controls. Name save/cache behavior is shared in useTodoName, with the current draft held in a ref for immediate submit events.

Verification: 25 client tests, lint, typecheck and iOS/Android/web exports pass. Review of the installed native APIs found no confirmed issues. Attempted local Simulator verification: Expo Go installed and the bundle loaded, but native computer control remained blocked by macOS Accessibility and Screen Recording permissions on two attempts. Native layout/tap/keyboard verification remains outstanding; bundle export does not establish that those gestures work. Temporary simulator/server processes are cleaned up; original user edits remain unstaged.

## Pin Lists form-sheet layout

The user isolated a separate native failure: the grid renders when presented normally, but disappears in a Stack `formSheet`, sometimes after scrolling. The earlier browser color fallback did not address this symptom. Installed react-native-screens 4.26 source (`RNSScreen.mm`, `RNSScreenContentWrapper.mm`) forcibly sizes the first React Native scroll view to the sheet bounds. Its sizing logic supports a preceding header, but does not subtract a sibling footer.

ListGrid now returns its FlatList directly, with the bounded, centered width on the scroll content. PinListsSheet puts Save/Cancel and errors inside the grid's ListFooterComponent; the native button Host matches height only, with width measured inside that content. Short grids place the actions at the bottom; longer grids scroll together with the actions. The user's current `formSheet` route configuration is preserved.

Verification: 25 existing tests, lint, typecheck and an iOS bundle export pass. These checks do not reproduce UIKit sheet sizing. Native confirmation after scrolling, selecting and expanding the sheet is pending; the layout change addresses the source-level sizing constraint but is not yet an observed fix on the user's device. Pre-existing navigation changes, formatting and footer padding remain uncommitted.
