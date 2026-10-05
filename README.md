# Eves assignment MVP

Expo SDK 57 / React Native / Expo UI client and Laravel 13 / Sanctum / SQLite API. The API contract stays v1; todo revisions change independently.

Laravel is the server framework: it handles database models/migrations, request validation, authorization and HTTP routes. Sanctum supplies revocable bearer tokens for guest and email/password accounts.

## Run locally

API (PHP 8.3+ and Composer):

```sh
cd todo-app-api
composer install
cp .env.example .env # only for a fresh checkout; preserve your existing .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

Run the client in a second terminal (Node 22.13+; this workspace was verified with Node 26):

```sh
cd todo-app-client
npm ci
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000/api for a physical device.
npx expo start
```

The default API URL is localhost:8000/api for iOS/web and 10.0.2.2:8000/api for the Android emulator. Restart Expo after changing the URL. Use a native development build to verify platform controls and reminders; configure generated native projects through app.json, not by hand. The optional web preview is for development; its credentials/cache use localStorage, while native uses SecureStore/SQLite. Native destructive confirmation dialogs are not supported by the web preview.

## Demo workflow

Start with an empty database; no demo login or sample lists are seeded. For a fresh recording, stop the API and run `php artisan migrate:fresh` inside `todo-app-api`, then restart it using the command above. This deletes all accounts and app data. Reload the client: a missing or rejected saved token automatically provisions a fresh guest using the installation's device ID. You do not need to clear app storage or sign in. Valid saved sessions are retained; connection/server failures do not discard credentials. Guest provisioning requires a reachable API.

1. Create a first list as a guest, then add/edit/complete todos. First provisioning needs internet.
2. After the first successful snapshot, disconnect, edit/create todos or create a list, restart, and reconnect. Pending actions survive restart. Conflicting todo revisions produce a separate copy.
3. Register in Settings to retain the guest lists. Logging into an existing account replaces the guest; sign-out provisions a fresh guest. Pending work must sync or be explicitly discarded before switching.
4. Share a list with another email, including an unregistered recipient. That recipient registers, requests verification, reads the development code in todo-app-api/storage/logs/laravel.log, verifies, and accepts in Settings. No real email is sent with the default log mailer.
5. Members can edit todos; only the owner edits/deletes the list or manages recipients. Revoked access removes the list at the next refresh.
6. Add a deadline more than 24 hours ahead and grant native notification permission. A reminder is scheduled one day before; past reminder times are skipped. Shared-device changes can leave reminders stale until refresh.

## Verification

```sh
cd todo-app-api
php artisan test
./vendor/bin/pint --test
```

```sh
cd todo-app-client
npm test
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export --platform web
```

Latest checks: 15 backend tests / 192 assertions, Pint, 30 client tests, TypeScript and ESLint. A live HTTP check confirmed stale-token recovery into one device-linked guest with empty lists and session reuse. Previous verification included Expo doctor (18/18), platform exports, guest onboarding and a two-user HTTP smoke covering auth, verification/sharing, member permissions, revisions, idempotent retries, HEAD and hard deletion.

Remaining manual verification: iOS/Android rendering, keyboard behavior and actual notification delivery. No production deployment, conversation capture, password recovery or guest restoration is included.

See docs/plans/2026-10-02-eves-implementation-plan.md, the PRD and the frozen API contract.
