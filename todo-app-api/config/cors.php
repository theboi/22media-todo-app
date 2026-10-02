<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:8081,http://localhost:8082,http://127.0.0.1:8081,http://127.0.0.1:8082')),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'Idempotency-Key'],
    'exposed_headers' => ['X-Eves-API-Version', 'Retry-After', 'Allow'],
    'max_age' => 600,
    'supports_credentials' => false,
];
