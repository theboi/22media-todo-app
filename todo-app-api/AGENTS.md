Applies to every file under `todo-app-api/`. This is a Laravel API for the Expo/React Native client.

## Framework context

- Read `composer.json` and `composer.lock` before using framework APIs; consult documentation matching the installed Laravel/PHP versions.
- Prefer Laravel's built-in capabilities and conventional structure. Keep the MVP lightweight; add dependencies and abstractions only to solve demonstrated needs.

## Working rules

- Inspect the target, callers, dependencies, tests, and relevant commands before editing.
- Preserve unrelated changes and generated files; apply conventions to new or touched code.
- Keep classes and methods focused on one responsibility. Extract independent workflows before files become large.
- Prefer explicit types, guard clauses, and straightforward composition.

## Structure and responsibilities

- `routes/api.php` declares endpoints and middleware; controllers coordinate validation, authorization, workflows, and responses.
- Form Requests own input validation and contract-specific normalization; policies own resource authorization.
- API Resources define public response fields; models own relationships, casts, and focused persistence behavior.
- Extract substantial workflows into `app/Actions/<Feature>/` when needed; simple CRUD does not require an action or service layer.
- Inject external capabilities where useful. Avoid pass-through repositories, speculative interfaces, and DTOs for every endpoint.
- Keep multi-record workflows explicit rather than hiding them in model observers.

## API contracts and security

- Follow `../docs/plans/2026-10-02-eves-api-contract-v1.md`; preserve its endpoints, response shapes, errors, headers, and retry behavior.
- API version stays **v1 throughout MVP**, with `X-Eves-API-Version: 1`. Never increment it for implementation or data changes; keep client and API on the same v1 contract without legacy aliases, compatibility layers, or version fallbacks.
- `todo.version` is a changing data revision, independent of the fixed API version; follow the contract's increment rules.
- Consume only validated, explicitly allowed fields. Reject unknown fields; preserve missing-versus-null and exact JSON type semantics.
- Normalize only contract-specified fields. Configure Laravel's default trimming and empty-string conversion so description whitespace and nullable fields retain their intended meaning.
- Use Sanctum bearer authentication for protected routes; resolve guest and registered account identity explicitly.
- Scope queries to accessible records and authorize every operation; authentication, token abilities, and route binding do not prove access.
- Set ownership, identity, timestamps, and revisions server-side; accept client-generated resource IDs only where specified. Never mass-assign raw request data.
- Centralize safe JSON error rendering; keep credentials, verification codes, and stack traces out of responses and logs.
- Read environment variables in config files and use `config()` elsewhere. Apply the contract's authentication and verification rate limits.

## Database and side effects

- Use migrations for schema changes, with foreign keys, uniqueness constraints, and indexes supporting actual queries.
- Eager-load required relationships; detect accidental lazy loading in development/tests. Keep serialization free of unexpected queries.
- Use short transactions for related writes and invariants; commit retry receipts atomically with mutations.
- Verify revision increments, retry races, and snapshot consistency against the selected database engine.
- Keep network calls outside database transactions. If queues are needed, dispatch dependent side effects after commit and make retries safe.
- Preserve hard deletes, complete unpaginated collections, and device-owned reconciliation as specified; avoid extra synchronization infrastructure.

## Testing and verification

- Prefer HTTP feature tests covering routes, middleware, authorization, response contracts, and persisted outcomes.
- Cover invalid input, cross-account access, guest transitions, retries, unchanged updates, and transaction rollback.
- Use factories and isolated test databases; fake external effects rather than Eloquent or internal implementation details.
- Reserve unit tests for meaningful isolated logic; avoid tests that merely repeat implementation.
- Treat Composer scripts and project configuration as authoritative. Run focused tests during development and affected broader checks before handoff.
- Once installed, use `php artisan test` and `./vendor/bin/pint --test`; report failed or skipped checks.
