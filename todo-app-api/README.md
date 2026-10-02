# Eves Laravel API

Laravel 13.34, PHP 8.3+, Sanctum 4.3 and SQLite implement the frozen v1 contract in `../docs/plans/2026-10-02-eves-api-contract-v1.md`.

Run from this directory:

```sh
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

The mobile client uses your development computer's LAN IP on a physical device. Development CORS permits localhost and 127.0.0.1 on ports 8081 and 8082; change `CORS_ALLOWED_ORIGINS` in `.env` for another web origin. SQLite enables foreign keys, WAL and a 5-second writer busy timeout. This MVP targets SQLite; the account XOR constraint is enforced by SQLite triggers.

Verification messages use the development log mailer. Read the six-digit code in `storage/logs/laravel.log`; API responses never contain it. Registration does not send mail automatically. Tokens remain revocable and have no automatic expiry.

Account-scoped layout lives in the separate `user_settings` table, including guest accounts. `accounts.has_created_list` preserves the first-list rule after layouts or lists are removed. `accounts` is the Sanctum principal; its user/device identity is an exclusive-or invariant.

Sharing uses normalized `shares` records with UUID/status/creator/timestamps rather than duplicating conceptual `todo_lists.shared_emails`, `users.list_ids` and `users.pending_shares` JSON indexes. Unique `(todo_list_id,email)` and indexed recipient queries derive the same complete discovery collections and access rules. A pending share is discoverable as soon as its matching recipient registers; accepted status plus verified email grants access. This avoids maintaining redundant copies of membership and still follows every v1 response and lifecycle rule. Revocation/decline/leave physically remove the record.

Mutation receipts store account/key, normalized method/path/payload hash, original status and resource ID only. Mutation and receipt share one short SQLite write transaction. Replay returns the current accessible resource or 404, and exact committed no-body retries return 204. No resource bodies, old revisions, soft deletes or deleted-resource history are retained. Snapshot reads one database transaction; reconciliation and conflict copies remain client responsibilities.

Verify with:

```sh
php artisan test
./vendor/bin/pint --test
```

Feature tests isolate an in-memory SQLite database and fake mail only. They cover auth transitions, strict JSON input, cross-account access, verified sharing, layouts, revision no-ops, headers/HEAD, retry recovery and hard deletion. Native device behavior is outside this backend test suite.
