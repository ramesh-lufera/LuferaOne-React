<?php

namespace Tests\Feature;

use App\Models\Company;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompanyBrandingTest extends TestCase
{
    use DatabaseMigrations;

    private function image(string $name): string
    {
        $path = 'companies/'.$name.'.png';
        Storage::disk('local')->put($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));

        return $path;
    }

    public function test_guest_branding_contains_only_available_image_urls_and_signed_images_are_public(): void
    {
        Storage::fake('local');
        Company::factory()->create(['logo_path' => $this->image('logo'), 'sign_in_image_path' => $this->image('signin'), 'sign_up_image_path' => $this->image('signup'), 'site_logo_path' => $this->image('favicon')]);
        $response = $this->getJson('/api/auth/branding')->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $this->assertSame(['images'], array_keys($response->json()));
        $this->assertSame(['logo_url', 'sign_in_image_url', 'sign_up_image_url', 'site_logo_url'], array_keys($response->json('images')));
        foreach ($response->json('images') as $url) {
            $this->get($url)->assertOk()->assertHeader('Content-Type', 'image/png')->assertHeader('X-Content-Type-Options', 'nosniff');
        }
        $this->getJson('/api/company')->assertUnauthorized();
        $this->get('/api/company/images/logo')->assertForbidden();
    }

    public function test_no_profile_empty_deleted_and_invalid_files_return_null_urls(): void
    {
        Storage::fake('local');
        $empty = ['logo_url' => null, 'sign_in_image_url' => null, 'sign_up_image_url' => null, 'site_logo_url' => null];
        $this->getJson('/api/auth/branding')->assertExactJson(['images' => $empty]);
        $company = Company::factory()->create();
        $this->getJson('/api/auth/branding')->assertExactJson(['images' => $empty]);
        Storage::disk('local')->put('companies/invalid.png', 'This is not an image');
        $company->forceFill(['logo_path' => 'companies/deleted.png', 'sign_in_image_path' => '../private.png', 'sign_up_image_path' => 'companies/invalid.png'])->save();
        $this->getJson('/api/auth/branding')->assertExactJson(['images' => $empty]);
    }

    public function test_replacement_changes_urls_and_deleted_files_are_not_served(): void
    {
        Storage::fake('local');
        $company = Company::factory()->create(['logo_path' => $this->image('first')]);
        $url = $this->getJson('/api/auth/branding')->json('images.logo_url');
        $company->forceFill(['logo_path' => $this->image('second')])->save();
        $updatedUrl = $this->getJson('/api/auth/branding')->json('images.logo_url');
        $this->assertNotSame($url, $updatedUrl);
        $this->get($updatedUrl)->assertOk();
        Storage::disk('local')->delete($company->logo_path);
        $this->getJson('/api/auth/branding')->assertJsonPath('images.logo_url', null);
        $this->get($updatedUrl)->assertNotFound();
    }
}
