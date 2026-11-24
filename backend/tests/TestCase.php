<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Mail;

abstract class TestCase extends BaseTestCase
{
    protected function verificationPath(?string $body = null): string
    {
        $body ??= Mail::mailer('array')->getSymfonyTransport()->messages()->last()->getOriginalMessage()->getTextBody();
        preg_match('/Verify Email: (\S+)/', $body, $matches);
        parse_str(parse_url($matches[1], PHP_URL_FRAGMENT), $fragment);

        return $fragment['verify'];
    }
}
