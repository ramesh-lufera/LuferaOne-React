<?php

$resolveCaBundle = static function (?string $configuredPath): ?string {
    $locations = openssl_get_cert_locations();
    $candidates = [
        $configuredPath,
        ini_get('curl.cainfo'),
        ini_get('openssl.cafile'),
        env('SSL_CERT_FILE'),
        env('CURL_CA_BUNDLE'),
        $locations['default_cert_file'] ?? null,
        '/etc/ssl/certs/ca-certificates.crt',
        '/etc/pki/tls/certs/ca-bundle.crt',
        '/etc/ssl/cert.pem',
        PHP_BINDIR.'/extras/ssl/cacert.pem',
        dirname(PHP_BINDIR).'/apache/bin/curl-ca-bundle.crt',
        'C:/xampp/apache/bin/curl-ca-bundle.crt',
    ];
    foreach ($candidates as $path) {
        if (is_string($path) && $path !== '' && is_file($path) && is_readable($path)) {
            return $path;
        }
    }

    return null;
};

$googleCaBundle = $resolveCaBundle(env('GOOGLE_CA_BUNDLE'));
$facebookCaBundle = $resolveCaBundle(env('FACEBOOK_CA_BUNDLE') ?: $googleCaBundle);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'facebook' => [
        'app_id' => env('FACEBOOK_APP_ID'),
        'app_secret' => env('FACEBOOK_APP_SECRET'),
        'graph_version' => env('FACEBOOK_GRAPH_VERSION', 'v27.0'),
        'ca_bundle' => $facebookCaBundle,
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'ca_bundle' => $googleCaBundle,
    ],

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
