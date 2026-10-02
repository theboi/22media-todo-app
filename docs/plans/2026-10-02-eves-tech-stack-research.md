# Eves assignment stack research

Date: 2026-10-02. Scope: primary-source documentation review; no installations or runtime compatibility test.

## Recommendation

Keep the existing Expo SDK 57, React Native, TypeScript, and Expo Router client. The user selected Expo UI: use its native controls, React Native screen layouts, and platform adapters where required. Use native fetch, Expo SQLite for snapshots and pending actions, SecureStore for bearer credentials, Expo Network for reconnect hints, and Expo Notifications for local deadline reminders. Use Laravel with Eloquent, Sanctum, policies, validation, and ordinary transactional CRUD endpoints and one full-snapshot read. Start the server with SQLite for a single-server assignment demo. Add Fortify only if the agreed authentication scope warrants its registration/recovery/verification workflows. These are engineering recommendations, not claims that the complete dependency combination has been tested.

The difficult part is shared offline reconciliation and guest-to-user account transitions. A UI library or database switch does not solve either. Spend assignment effort on retry-safe mutations, conflict behavior, and access checks before adding styling infrastructure.

## Repository evidence

`todo-app-client/package.json` declares Expo `~57.0.26`, React Native `0.86.3`, React `19.2.3`, Expo Router `~57.0.24`, Reanimated `4.5.1`, and Worklets `0.10.1`. It does not declare gluestack, NativeWind, Tailwind, SQLite, SecureStore, Network, or Notifications. This is manifest evidence; installed dependency resolution and runtime behavior were not audited.

`todo-app-client/AGENTS.md` prefers inline TSX styles and semantic theme tokens, existing system components, Expo Router, and `npx expo install` for dependency additions. A wholesale utility-styling migration would be a deliberate departure from the current preference, not a prerequisite for the requested app.

## Selected UI: Expo UI

The matching SDK 57 reference documents `@expo/ui` `~57.0.21`, already declared in the client manifest, and marks it included in Expo Go. It exposes SwiftUI on Apple platforms and Jetpack Compose on Android. The SwiftUI export cannot run on Android or web. Expo UI components require a `Host`; React Native flexbox applies to that boundary, while content inside uses native layout rather than Yoga. Keep native layout regions self-contained. [SDK 57 Expo UI](https://docs.expo.dev/versions/v57.0.0/sdk/ui/)

SDK 57 also has a **universal API exported from `@expo/ui`**, including Host, Button, Checkbox, TextInput, and other controls. It delegates to SwiftUI on iOS and Compose on Android, with JavaScript web implementations. This means platform adapters are needed only for controls/modifiers/behavior beyond the universal API, rather than automatically for every button. [SDK 57 universal UI](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/)

Recommendation: React Native screens own layout and growing task lists; reusable controls use the universal Expo UI API where it meets requirements. Where native capabilities differ, use `.ios.tsx`/`.android.tsx` implementations behind the same small product-facing interface. SwiftUI imports come from `@expo/ui/swift-ui`, Android-specific imports from `@expo/ui/jetpack-compose`. Cross-platform Host handles native toolkit dispatch. [Universal Host](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/host/), [SwiftUI](https://docs.expo.dev/versions/v57.0.0/sdk/ui/swift-ui/), [Jetpack Compose](https://docs.expo.dev/versions/v57.0.0/sdk/ui/jetpack-compose/)

Expo UI itself does not force a development build when using a matching Expo Go binary that already includes it. Changes requiring new native configuration or modules absent from Expo Go still need a new binary. Verify native controls, keyboard behavior, accessibility, Host sizing, and reminders in real iOS/Android development builds before delivery. The exact declared package combination has **not** been built or tested by this research.

## Previously considered UI: gluestack (not selected)

The current official gluestack installation documentation is v5. It lists Expo >=50 and React Native >=0.72.5, and offers NativeWind v5 (Tailwind CSS v4 plus PostCSS) or UniWind (Expo-only, Tailwind CSS v4). Initialization configures provider, Metro, Babel, global CSS, and entry files. These minimum-version claims establish advertised broad support; they do **not** establish that the exact Expo 57 / RN 0.86.3 / React 19.2.3 / Reanimated 4.5.1 combination works. The same page documents dependency/build troubleshooting. [gluestack v5 installation](https://v5.gluestack.io/ui/docs/home/getting-started/installation)

The v5 upgrade instructions currently show `nativewind@^5.0.0-preview.4`, `react-native-css@^3.0.4`, `@gluestack-ui/core@^5.0.15`, and `@gluestack-ui/utils@^5.0.6`. Avoid assuming that “latest gluestack” means a stable NativeWind release. [gluestack v5 upgrade](https://v5.gluestack.io/ui/docs/guides/more/upgrade-to-v5)

NativeWind's general installation page explicitly distinguishes its Tailwind 3/Babel/Metro setup from the separate v5 guide. Do not mix recipes across generations. [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)

Gluestack is not selected. The compatibility findings above are retained as research history; they do not change the user's Expo UI choice. No gluestack compatibility spike was performed.

## Expo SDK 57: matching versioned docs exist

All four requested SDK 57 pages were successfully retrieved. The versions below are the documentation's recommended module versions at research time, not dependencies installed by this task. Resolve additions with `npx expo install`, then verify the actual result.

| Module | SDK 57 documented version | Role and limitations |
| --- | --- | --- |
| `expo-sqlite` | `~57.0.3` | Persistent local database, parameterized CRUD, provider, transactions. Its ordinary async transaction can include other concurrent queries; use deliberate serialization or the documented exclusive transaction API for atomic snapshot/outbox changes. [SDK 57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/) |
| `expo-secure-store` | `~57.0.4` | Encrypted key/value credential persistence, included in Expo Go. Large values may fail; biometric authentication has an Expo Go limitation; config-plugin changes require a new binary. Store tokens here, not the whole task dataset. [SDK 57 SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/) |
| `expo-network` | `~57.0.2` | Included in Expo Go; network state hook/listener. iOS internet reachability equals connection state, so successful API responses must determine server reachability; connectivity events merely trigger an attempt. [SDK 57 Network](https://docs.expo.dev/versions/v57.0.0/sdk/network/) |
| `expo-notifications` | `~57.0.21` | Scheduled one-off reminders support cached deadlines. Local notifications remain available in Expo Go; Android remote push requires a development build. Android exact scheduling requires the documented alarm permission, and notification permissions/channels require platform handling. [SDK 57 Notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/) |

Recommended reminder policy: schedule one day before each cached deadline, persist notification IDs, and cancel/reschedule on edits, completion, deletion, and synchronization. This is application design, not an automatic Expo feature. Local scheduling cannot learn another user's deadline change while disconnected. Do not promise precise delivery or background synchronization merely because local reminders exist. Test reminder behavior on real iOS and Android devices with a development build before the assignment demonstration.

The repo's generic rule that every new native dependency requires a development build is broader than the SDK documentation: modules already bundled in Expo Go can be exercised there. Native configuration changes and dependencies absent from its binary require a new build. Use development builds for realistic final verification even when initial CRUD work can run in Expo Go.

## Laravel authentication: Sanctum and Fortify solve different pieces

Sanctum explicitly supports mobile bearer-token authentication. Its documented flow creates a credential exchange endpoint, issues a token, sends it in Authorization, protects routes with `auth:sanctum`, and supports revocation and token abilities. Tokens do not substitute for per-list authorization. [Laravel 13 Sanctum](https://laravel.com/framework/docs/13.x/sanctum)

Fortify is headless authentication infrastructure for registration, login, password recovery, and related workflows; mobile screens and integration remain application work. Its documented registration/login routes are not a ready-made guest account plus mobile token lifecycle. [Laravel 13 Fortify](https://laravel.com/framework/docs/13.x/fortify)

Guest account creation, authenticated guest credentials, identity linking, and existing-user session replacement are **custom product behavior**. A device identifier is metadata, not a secret credential. If the requested nullable `accounts.user_id` model remains, choose an explicit token principal and server account mapping before implementation: guest tokens must authenticate even before a registered User exists, and signed-in users need deterministic access to their guest-owned records. Sanctum's mobile example authenticates User; it does not implement that account transition for us.

## Server database: SQLite is sufficient for the demo, conditionally

Laravel officially supports SQLite and PostgreSQL, exposes Eloquent/query builder, enables SQLite foreign keys by default, and provides `DB::transaction` with rollback on failure. SQLite needs a persistent database file; choose it when the demo runs on one application server with durable local storage. [Laravel 13 database](https://laravel.com/framework/docs/13.x/database)

SQLite permits many readers but only one writer at a time. Its own guidance recommends a client/server database for high write concurrency or multiple application servers. Mobile clients must call Laravel; they must never directly share the server database file. [SQLite appropriate uses](https://www.sqlite.org/whentouse.html)

Recommendation: use server SQLite for the assignment unless chosen hosting requires managed PostgreSQL or lacks persistent local storage. If so, use PostgreSQL from the beginning and test against it. Either choice still requires atomic mutation-result persistence, unique operation IDs, atomic todo revision increments, and short transactions. Do not assume PostgreSQL row-lock behavior carries over to SQLite: design and test the reconciliation algorithm against the actual selected engine.

## Unverified items before implementation

- No exact Expo/RN/React/gluestack dependency compatibility was verified by installation, doctor, native build, or device test.
- No Laravel backend manifest or chosen hosting contract was examined; Laravel 13 documentation establishes current supported capabilities, not the project's installed version.
- Reminder permission behavior, reboot persistence, deadline/timezone edge cases, and guest reinstall recovery need explicit product choices and device verification.
- Offline conflict comparison is now a device-owned todo-revision comparison, not field-wise divergence detection. None of the recommended modules supplies this queue/replay policy automatically.

## Final product decisions

Authentication is email/password. Guest registration converts its account, clears first_device and preserves its lists. Existing-user sign-in replaces the guest session without merging. Sign-out provisions a fresh device guest; original guest restoration is excluded from MVP. This narrows the custom account-transition work but does not make it a built-in Sanctum workflow.

## Updated reconciliation decision

The fixed v1 API now returns ordinary resources and a full snapshot. Device compares cached todo.version against current snapshot once, then uses ordinary POST-copy or PATCH; deletes are hard deletes without retained deletion history. Laravel does not merge local state or copy conflicts. API version v1 is fixed; todo.version is a changing data revision. Operation receipts contain retry metadata only. The contract records last-write-wins races between the single comparison and writes; do not assume SQLite, Sanctum or a UI library solves those races.
