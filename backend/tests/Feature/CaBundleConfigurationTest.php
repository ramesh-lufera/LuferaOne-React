<?php

namespace Tests\Feature;

use Illuminate\Support\Env;
use Tests\TestCase;

class CaBundleConfigurationTest extends TestCase
{
    public function test_readable_explicit_bundle_takes_precedence_for_both_providers(): void
    {
        $path = tempnam(storage_path('framework'), 'ca-test-');
        $repository = Env::getRepository();
        $previousGoogle = $repository->get('GOOGLE_CA_BUNDLE');
        $previousFacebook = $repository->get('FACEBOOK_CA_BUNDLE');
        try {
            $repository->set('GOOGLE_CA_BUNDLE', $path);
            $repository->set('FACEBOOK_CA_BUNDLE', '');
            $services = require config_path('services.php');
            $this->assertSame($path, $services['google']['ca_bundle']);
            $this->assertSame($path, $services['facebook']['ca_bundle']);
        } finally {
            $repository->clear('GOOGLE_CA_BUNDLE');
            $repository->clear('FACEBOOK_CA_BUNDLE');
            if ($previousGoogle !== null) {
                $repository->set('GOOGLE_CA_BUNDLE', $previousGoogle);
            }
            if ($previousFacebook !== null) {
                $repository->set('FACEBOOK_CA_BUNDLE', $previousFacebook);
            }
            unlink($path);
        }
    }

    public function test_missing_platform_specific_bundle_falls_back_to_auto_detection(): void
    {
        $repository = Env::getRepository();
        $previous = $repository->get('GOOGLE_CA_BUNDLE');
        try {
            $repository->set('GOOGLE_CA_BUNDLE', 'Z:/missing-platform-certificate.pem');
            $services = require config_path('services.php');
            $bundle = $services['google']['ca_bundle'];
            $this->assertNotSame('Z:/missing-platform-certificate.pem', $bundle);
            $this->assertTrue($bundle === null || (is_file($bundle) && is_readable($bundle)));
        } finally {
            $repository->clear('GOOGLE_CA_BUNDLE');
            if ($previous !== null) {
                $repository->set('GOOGLE_CA_BUNDLE', $previous);
            }
        }
    }
}
