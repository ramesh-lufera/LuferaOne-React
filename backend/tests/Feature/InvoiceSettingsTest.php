<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class InvoiceSettingsTest extends TestCase
{
    use DatabaseMigrations;

    private function settings(array $overrides = []): array
    {
        return array_replace(['prefix' => 'INV-', 'series' => '0001', 'suffix' => '-2026', 'version' => (int) DB::table('invoice_settings')->where('id', 1)->value('version')], $overrides);
    }

    private function invoice(array $overrides = []): array
    {
        return array_replace(['request_id' => (string) Str::uuid(), 'customer_name' => 'Test Customer', 'issued_on' => '2026-11-17', 'items' => [['description' => 'Service', 'quantity' => 3, 'unit_price' => '19.99']]], $overrides);
    }

    private function image(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('logo.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
    }

    public function test_settings_and_billing_follow_their_module_permissions(): void
    {
        $this->getJson('/api/invoice-settings')->assertUnauthorized();
        $this->postJson('/api/invoices', $this->invoice())->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/invoice-settings')->assertForbidden();
        $this->putJson('/api/invoice-settings', $this->settings())->assertForbidden();
        $this->getJson('/api/invoices')->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['invoices'])]);
        $this->getJson('/api/invoices/next-number')->assertOk()->assertJsonPath('next_invoice_number', 'INV-0001');
        $this->postJson('/api/invoices', $this->invoice())->assertCreated();
        $this->getJson('/api/invoice-settings')->assertForbidden();
    }

    public function test_saved_settings_reload_and_series_preserves_zeros_and_expands_on_rollover(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->putJson('/api/invoice-settings', $this->settings())->assertOk()->assertJsonPath('settings.series', '0001')->assertJsonPath('settings.next_invoice_number', 'INV-0001-2026');
        $this->getJson('/api/invoice-settings')->assertOk()->assertJsonPath('settings.prefix', 'INV-')->assertJsonPath('settings.suffix', '-2026');
        $this->postJson('/api/invoices', $this->invoice())->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-0001-2026')->assertJsonPath('invoice.total_cents', 5997);
        $this->postJson('/api/invoices', $this->invoice())->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-0002-2026');
        $this->getJson('/api/invoice-settings')->assertJsonPath('settings.series', '0003');
        $this->putJson('/api/invoice-settings', $this->settings(['series' => '9999']))->assertOk();
        $this->postJson('/api/invoices', $this->invoice())->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-9999-2026');
        $this->postJson('/api/invoices', $this->invoice())->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-10000-2026');
    }

    public function test_retries_are_idempotent_and_old_numbers_are_immutable_after_settings_changes(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $data = $this->invoice();
        $first = $this->postJson('/api/invoices', $data)->assertCreated()->json('invoice');
        $this->postJson('/api/invoices', $data)->assertCreated()->assertJsonPath('invoice.id', $first['id']);
        $this->assertDatabaseCount('invoices', 1);
        $this->assertDatabaseHas('invoice_settings', ['id' => 1, 'next_number' => 2]);
        $this->postJson('/api/invoices', array_replace($data, ['customer_name' => 'Changed']))->assertConflict();
        $this->putJson('/api/invoice-settings', $this->settings(['prefix' => 'BILL-', 'suffix' => '-NEW', 'series' => '0050']))->assertOk();
        $this->getJson('/api/invoices/'.$first['id'])->assertOk()->assertJsonPath('invoice.invoice_number', 'INV-0001');
        $updated = $data;
        unset($updated['request_id']);
        $updated['customer_name'] = 'Updated Customer';
        $this->putJson('/api/invoices/'.$first['id'], $updated)->assertOk()->assertJsonPath('invoice.invoice_number', 'INV-0001');
        $this->postJson('/api/invoices', $this->invoice())->assertCreated()->assertJsonPath('invoice.invoice_number', 'BILL-0050-NEW');
        $this->getJson('/api/invoices?search=Updated')->assertOk()->assertJsonCount(1, 'data');
        $this->putJson('/api/invoice-settings', $this->settings(['suffix' => '']))->assertOk()->assertJsonPath('settings.series', '0002');
        $this->postJson('/api/invoices', $this->invoice())->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-0002');
    }

    public function test_stale_configuration_edits_cannot_rewind_a_concurrent_allocation(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']), 'sanctum');
        $stale = $this->settings();
        $this->postJson('/api/invoices', $this->invoice())->assertCreated();
        $this->putJson('/api/invoice-settings', $stale)->assertConflict();
        $this->getJson('/api/invoice-settings')->assertJsonPath('settings.series', '0002');
    }

    public function test_logos_are_private_managed_and_snapshotted_for_existing_invoices(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $saved = $this->post('/api/invoice-settings', $this->settings() + ['_method' => 'PUT', 'logo' => $this->image()], ['Accept' => 'application/json'])->assertOk();
        $path = DB::table('invoice_settings')->value('logo_path');
        Storage::disk('local')->assertExists($path);
        $this->get('/api/invoice-settings/logo')->assertForbidden();
        $this->get($saved->json('settings.logo_url'))->assertOk();
        $invoice = $this->postJson('/api/invoices', $this->invoice())->assertCreated()->json('invoice');
        $this->putJson('/api/invoice-settings', $this->settings() + ['logo' => $this->image()])->assertOk();
        $newPath = DB::table('invoice_settings')->value('logo_path');
        Storage::disk('local')->assertExists($path);
        $this->get($invoice['logo_url'])->assertOk();
        $this->putJson('/api/invoice-settings', $this->settings() + ['remove_logo' => true])->assertOk()->assertJsonPath('settings.logo_url', null);
        Storage::disk('local')->assertMissing($newPath);
        Storage::disk('local')->assertExists($path);
    }

    public function test_validation_and_audit_failures_leave_counters_and_files_consistent(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->putJson('/api/invoice-settings', $this->settings(['series' => '0000']))->assertUnprocessable()->assertJsonValidationErrors('series');
        $this->putJson('/api/invoice-settings', $this->settings() + ['logo' => UploadedFile::fake()->create('logo.svg', 1, 'image/svg+xml')])->assertUnprocessable()->assertJsonValidationErrors('logo');
        $this->postJson('/api/invoices', $this->invoice(['invoice_number' => 'override']))->assertUnprocessable()->assertJsonValidationErrors('invoice_number');
        $this->postJson('/api/invoices', $this->invoice(['items' => [['description' => 'Invalid', 'quantity' => 0, 'unit_price' => '1.001']]]))->assertUnprocessable();
        $this->mock(ActivityLogger::class, function ($mock): void {
            $mock->shouldReceive('record')->andThrow(new \RuntimeException('Audit unavailable'));
        });
        $this->putJson('/api/invoice-settings', $this->settings() + ['logo' => $this->image()])->assertServerError();
        $this->assertSame([], Storage::disk('local')->allFiles('invoice-logos'));
        $this->postJson('/api/invoices', $this->invoice())->assertServerError();
        $this->assertDatabaseCount('invoices', 0);
        $this->assertDatabaseHas('invoice_settings', ['id' => 1, 'next_number' => 1, 'version' => 0]);
    }

    public function test_exhausted_series_and_database_constraints_prevent_duplicate_numbers(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->putJson('/api/invoice-settings', $this->settings(['series' => '999999999999']))->assertOk();
        $this->postJson('/api/invoices', $this->invoice())->assertCreated();
        $this->postJson('/api/invoices', $this->invoice())->assertConflict();
        $this->getJson('/api/invoices/next-number')->assertJsonPath('next_invoice_number', null);
        $record = (array) DB::table('invoices')->first();
        unset($record['id']);
        $record['request_id'] = (string) Str::uuid();
        $this->expectException(UniqueConstraintViolationException::class);
        DB::table('invoices')->insert($record);
    }
}
