This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


## Working rules

- Inspect the target, callers, dependencies, tests, and relevant commands before editing.
- Keep units short, explicit, and single-responsibility; abstractions must reduce complexity.

## Architecture and components

- Screens own layout and compose feature sections; components own their behavior. Keep shared feature logic outside routes.
- Organize features by business workflow in `src/features/<feature>/`, with components, hooks, services, and types together.
- Routes may compose features and shared infrastructure. Features must not import routes or another feature's internals; shared UI must remain business-agnostic.
- Put reusable primitives in `src/components/ui/` and business-agnostic hooks in `src/hooks/`. Prefer existing system components before creating new primitives.
- Keep each file focused on one responsibility. Small private components or hooks may stay beside their owner; extract them when they gain independent behavior, reuse, tests, or make the file hard to follow. Avoid large files collecting multiple responsibilities; create component folders only when co-located files justify them.
- Centralize backend I/O, auth, transport, and serialization in `src/lib/api/`; validate untrusted data at boundaries and expose stable, safe errors. Keep server secrets out of the mobile bundle.
- Select fixture or live implementations at the app's composition boundary; consumers use shared contracts and do not inspect runtime mode.
- Required context accessors throw when their provider is absent; optional context is only for valid absence, never an authentication signal.

## Platform and mobile patterns

- Use `Platform.select` for small differences and platform-specific files for materially different implementations; keep their exported contracts consistent. Keep DOM elements and CSS in web-specific implementations.
- Prefer platform-native navigation and interactions when they suit the workflow; share business behavior without forcing identical presentation.
- Account for safe areas and navigator insets once; avoid hardcoded tab-bar heights. Use flexible layouts and bounded content widths, and `useWindowDimensions` when layout depends on available window size.
- Use `FlatList` or `SectionList` for growing task collections, with stable task IDs. Keep durable task state outside virtualized rows.

## React and TypeScript

- Declare components with `function ComponentName(...)`; prefer arrow functions elsewhere. Destructure props in the signature.
- Define small props inline and significant, discriminated, or reused props above the component; do not wrap props in `Readonly`.
- Use `React.*` for React types, explicit type-only imports, and `type` unless declaration merging or an extensible public contract requires `interface`.
- Use `UPPER_SNAKE_CASE` for true constants. Prefer named exports except where Expo Router requires defaults; avoid barrels.
- Keep feature-wide types in the feature's `types.ts`; reserve `src/types/` for cross-feature infrastructure types. Keep single-component props local.
- Prefer derived values, guard clauses, and `async`/`await`. Keep state local first, navigation-backed when shareable, and narrowly scoped context third.
- Avoid `any`, unsafe assertions, nested ternaries, deep nesting, and unnecessary effects. Inject the smallest capability at effectful boundaries.
- Keep runtime/config resolution in `.ts` modules outside providers; use `.tsx` only for JSX.

## Styling and accessibility

- Prefer inline styles in TSX over `StyleSheet.create`; compose theme/state values and caller styles with style arrays. Keep styling readable by extracting responsible components rather than growing large JSX blocks.
- Build themed primitives on native prop types such as `TextProps` and `ViewProps`; preserve accessibility props, compose event handlers, and support caller styling.
- Resolve semantic colors through one theme hook; keep navigation and content on the same resolved theme.
- Give custom pressable controls visible interaction feedback and explicit accessible roles and state.
- Screens arrange sections; components own internal styling. Use shared semantic theme tokens and avoid duplicating existing rules or overriding component internals from parents.
- Keep theme-dependent values in the theme system; component-local dynamic values are not design tokens.
- Make workflows self-explanatory through controls and real state. Keep copy concise and retain useful limits, privacy guidance, errors, and destructive-action warnings; omit internal implementation jargon.
- Target WCAG 2.1 AA where applicable: preserve accessible names, roles, screen-reader announcements, focus, contrast, keyboard support, and reduced motion. Never rely on color or touch alone.

## Testing and verification

- Co-locate meaningful unit/component tests. Test observable behavior at the largest useful unit with accessible queries and visible outcomes.
- Mock only impractical or external effect boundaries; reserve snapshots for visual baselines. Remove redundant tests only when stronger coverage remains.
- Treat `package.json` as authoritative. During development run the narrowest meaningful checks; before handoff run affected broader checks plus the required lint and typecheck, and report skipped checks.
