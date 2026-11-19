<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(): array
    {
        return ['full_name' => 'Lufera Infotech Pvt. Ltd. (OPC)', 'email' => 'info@example.test', 'phone_country_code' => '+91', 'phone_number' => '86-80808-204',
            'website' => 'www.example.com', 'country' => 'India', 'city' => 'Trichy', 'state' => 'Tamil Nadu', 'zip_code' => '620001',
            'address' => '96/1, Bharathidasan Salai', 'gstin' => '33AEZPA0582L1Z7'];
    }

    private function image(string $name = 'logo.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
    }

    public function test_company_endpoints_require_authentication(): void
    {
        $this->getJson('/api/company')->assertUnauthorized();
        $this->postJson('/api/company', $this->payload())->assertUnauthorized();
        $this->putJson('/api/company', $this->payload())->assertUnauthorized();
        $this->assertDatabaseCount('companies', 0);
    }

    public function test_shared_company_is_created_loaded_updated_and_audited(): void
    {
        $actor = User::factory()->create(['role' => 'admin']);
        $this->actingAs($actor, 'sanctum')->getJson('/api/company')->assertOk()->assertJsonPath('company', null);
        $result = $this->postJson('/api/company', $this->payload() + ['created_by' => 999, 'profile_key' => 'untrusted'])->assertCreated()->assertJsonPath('company.website', 'https://www.example.com');
        $id = $result->json('company.id');
        $this->assertDatabaseHas('companies', ['id' => $id, 'created_by' => $actor->id, 'profile_key' => 'shared']);
        $this->getJson('/api/company')->assertOk()->assertJsonPath('company.full_name', 'Lufera Infotech Pvt. Ltd. (OPC)');
        $another = User::factory()->create(['role' => 'admin']);
        $this->actingAs($another, 'sanctum')->putJson('/api/company', array_replace($this->payload(), ['full_name' => 'Updated Company']))->assertOk();
        $this->assertDatabaseCount('companies', 1);
        $this->assertDatabaseHas('companies', ['id' => $id, 'updated_by' => $another->id, 'created_by' => $actor->id, 'full_name' => 'Updated Company']);
        foreach (['Create' => $actor->id, 'Update' => $another->id] as $action => $userId) {
            $this->assertDatabaseHas('activity_logs', ['action' => $action, 'module' => 'Company', 'entity_id' => (string) $id, 'user_id' => $userId]);
        }
        $this->getJson('/api/activity-logs?module=Company&action=Update')->assertOk()->assertJsonPath('recordsFiltered', 1);
    }

    public function test_second_profile_is_rejected_and_validation_does_not_write_success_logs(): void
    {
        Company::factory()->create();
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum')->postJson('/api/company', $this->payload())->assertConflict();
        $this->putJson('/api/company', [])->assertUnprocessable()->assertJsonValidationErrors(['full_name', 'email', 'phone_number', 'gstin', 'country']);
        $this->assertDatabaseCount('companies', 1);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_invalid_fields_and_unsafe_uploads_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum')->postJson('/api/company', array_replace($this->payload(), [
            'email' => 'bad', 'website' => 'javascript://unsafe', 'phone_number' => '-------', 'phone_country_code' => '91', 'gstin' => 'bad',
            'logo' => UploadedFile::fake()->create('payload.svg', 1, 'image/svg+xml'),
        ]))->assertUnprocessable()->assertJsonValidationErrors(['email', 'website', 'phone_number', 'phone_country_code', 'gstin', 'logo']);
        $this->assertDatabaseCount('companies', 0);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_images_persist_replace_and_remove_after_successful_commit(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum')->post('/api/company', $this->payload() + ['logo' => $this->image(), 'sign_in_image' => $this->image('signin.png'), 'sign_up_image' => $this->image('signup.png')], ['Accept' => 'application/json'])->assertCreated()->assertJsonStructure(['company' => ['logo_url', 'sign_in_image_url', 'sign_up_image_url']]);
        $company = Company::firstOrFail();
        $previous = $company->logo_path;
        Storage::disk('local')->assertExists($previous);
        $this->post('/api/company', $this->payload() + ['_method' => 'PUT', 'logo' => $this->image('new.png')], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('local')->assertMissing($previous);
        Storage::disk('local')->assertExists($company->fresh()->logo_path);
        $this->putJson('/api/company', $this->payload() + ['remove_logo' => true])->assertOk()->assertJsonPath('company.logo_url', null);
        $this->assertNotNull($company->fresh()->sign_in_image_path);
    }

    public function test_site_logo_upload_reloads_replaces_and_removes_without_affecting_company_logo(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $saved = $this->post('/api/company', $this->payload() + ['logo' => $this->image(), 'site_logo' => $this->image('site.png')], ['Accept' => 'application/json'])->assertCreated();
        $this->get($saved->json('company.site_logo_url'))->assertOk();
        $company = Company::firstOrFail();
        $previous = $company->site_logo_path;
        $this->getJson('/api/company')->assertJsonPath('company.site_logo_url', fn ($url): bool => is_string($url));
        $this->post('/api/company', $this->payload() + ['_method' => 'PUT', 'site_logo' => $this->image('updated.png')], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('local')->assertMissing($previous);
        Storage::disk('local')->assertExists($company->fresh()->site_logo_path);
        $this->getJson('/api/auth/branding')->assertJsonPath('images.site_logo_url', fn ($url): bool => is_string($url));
        $this->putJson('/api/company', $this->payload() + ['remove_site_logo' => true])->assertOk()->assertJsonPath('company.site_logo_url', null);
        $this->getJson('/api/auth/branding')->assertJsonPath('images.site_logo_url', null);
        Storage::disk('local')->assertExists($company->logo_path);
        $this->assertDatabaseCount('companies', 1);
        $this->post('/api/company', $this->payload() + ['_method' => 'PUT', 'site_logo' => UploadedFile::fake()->create('unsafe.svg', 1, 'image/svg+xml')], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('site_logo');
    }

    public function test_company_images_require_an_unexpired_signed_link(): void
    {
        Storage::fake('local');
        $result = $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum')->post('/api/company', $this->payload() + ['logo' => $this->image()], ['Accept' => 'application/json'])->assertCreated();
        $url = $result->json('company.logo_url');
        $this->get($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertDatabaseCount('activity_logs', 1);
        $this->get('/api/company/images/logo')->assertForbidden();
        $this->travel(2)->hours();
        $this->get($url)->assertForbidden();
        $this->get('/api/company/images/password')->assertNotFound();
    }

    public function test_audit_failure_rolls_back_company_and_removes_uploaded_files(): void
    {
        Storage::fake('local');
        Schema::drop('activity_logs');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum')->post('/api/company', $this->payload() + ['logo' => $this->image()], ['Accept' => 'application/json'])->assertServerError();
        $this->assertDatabaseCount('companies', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_failed_update_retains_old_images_and_values(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum')->post('/api/company', $this->payload() + ['logo' => $this->image()], ['Accept' => 'application/json'])->assertCreated();
        $company = Company::firstOrFail();
        $previous = $company->logo_path;
        Schema::drop('activity_logs');
        $this->post('/api/company', array_replace($this->payload(), ['_method' => 'PUT', 'full_name' => 'Must roll back', 'logo' => $this->image('new.png')]), ['Accept' => 'application/json'])->assertServerError();
        $this->assertSame($previous, $company->fresh()->logo_path);
        $this->assertSame('Lufera Infotech Pvt. Ltd. (OPC)', $company->fresh()->full_name);
        $this->assertSame([$previous], Storage::disk('local')->allFiles());
    }
}
