<?php

$allowedOrigins = array_filter(array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:5173,http://127.0.0.1:5173'))));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,
    'mobile_web_origin' => env('MOBILE_SIGN_IN_WEB_ORIGIN', reset($allowedOrigins) ?: null),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
