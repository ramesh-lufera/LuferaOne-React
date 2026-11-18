<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class InvoiceWorkflowMySqlTest extends TestCase
{
    public function test_complete_authenticated_settings_and_billing_workflow_in_mysql(): void
    {
        if (getenv('INVOICE_MYSQL_INTEGRATION') !== '1' || DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run explicitly against local MySQL. Uses isolated temporary table copies and fake logo storage.');
        }
        $connection = DB::connection();
        $originalConnection = DB::getDefaultConnection();
        $prefix = 'invoice_workflow_'.bin2hex(random_bytes(6)).'_';
        $configuration = $connection->getConfig();
        $configuration['prefix'] = $prefix;
        $configuration['name'] = 'invoice_workflow';
        config(['database.connections.invoice_workflow' => $configuration]);
        $tables = ['roles', 'users', 'personal_access_tokens', 'activity_logs', 'invoice_settings', 'invoices'];
        Storage::fake('local');
        try {
            foreach ($tables as $table) {
                $connection->statement('CREATE TABLE `'.$prefix.$table.'` LIKE `'.$connection->getTablePrefix().$table.'`');
            }
            DB::setDefaultConnection('invoice_workflow');
            DB::table('roles')->insert(['name' => 'admin', 'active' => true, 'modules' => json_encode(['*']), 'created_at' => now(), 'updated_at' => now()]);
            DB::table('invoice_settings')->insert(['id' => 1, 'prefix' => 'INV-', 'next_number' => 1, 'series_width' => 4, 'suffix' => '', 'version' => 0, 'created_at' => now(), 'updated_at' => now()]);
            $this->assertSame('invoice_workflow', DB::connection()->getName());
            $actor = User::factory()->connection('invoice_workflow')->create(['role' => 'admin']);
            $this->assertSame(1, DB::table('users')->count());
            $token = $this->postJson('/api/login', ['email' => $actor->email, 'password' => 'password'])->assertOk()->json('token');
            $this->withToken($token);
            $this->getJson('/api/invoice-settings')->assertOk()->assertJsonPath('settings.series', '0001');
            $logo = UploadedFile::fake()->createWithContent('invoice-logo.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
            $this->post('/api/invoice-settings', ['_method' => 'PUT', 'prefix' => 'INV-', 'series' => '0001', 'suffix' => '-2026', 'version' => 0, 'logo' => $logo], ['Accept' => 'application/json'])
                ->assertOk()->assertJsonPath('settings.next_invoice_number', 'INV-0001-2026');
            $settings = $this->getJson('/api/invoice-settings')->assertOk()->json('settings');
            $this->get($settings['logo_url'])->assertOk();
            $this->getJson('/api/invoices/next-number')->assertOk()->assertJsonPath('next_invoice_number', 'INV-0001-2026');
            $payload = ['request_id' => (string) Str::uuid(), 'customer_name' => 'Workflow Customer', 'customer_email' => 'workflow@example.test', 'issued_on' => '2026-11-18', 'due_on' => '2026-11-30', 'items' => [['description' => 'Development', 'quantity' => 2, 'unit' => 'Hours', 'unit_price' => '49.95']]];
            $first = $this->postJson('/api/invoices', $payload)->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-0001-2026')->assertJsonPath('invoice.total_cents', 9990)->json('invoice');
            $this->postJson('/api/invoices', $payload)->assertCreated()->assertJsonPath('invoice.id', $first['id']);
            $payload['request_id'] = (string) Str::uuid();
            $this->postJson('/api/invoices', $payload)->assertCreated()->assertJsonPath('invoice.invoice_number', 'INV-0002-2026');
            $settings = $this->getJson('/api/invoice-settings')->assertOk()->assertJsonPath('settings.series', '0003')->json('settings');
            $this->putJson('/api/invoice-settings', ['prefix' => 'BILL-', 'series' => '0050', 'suffix' => '-2027', 'version' => $settings['version'], 'remove_logo' => true])->assertOk()->assertJsonPath('settings.logo_url', null);
            $this->getJson('/api/invoices/'.$first['id'])->assertOk()->assertJsonPath('invoice.invoice_number', 'INV-0001-2026');
            $this->get($first['logo_url'])->assertOk();
            $payload['request_id'] = (string) Str::uuid();
            $this->postJson('/api/invoices', $payload)->assertCreated()->assertJsonPath('invoice.invoice_number', 'BILL-0050-2027');
            unset($payload['request_id']);
            $payload['customer_name'] = 'Updated Workflow Customer';
            $this->putJson('/api/invoices/'.$first['id'], $payload)->assertOk()->assertJsonPath('invoice.invoice_number', 'INV-0001-2026')->assertJsonPath('invoice.customer_name', 'Updated Workflow Customer');
            $this->getJson('/api/invoices?search=Updated%20Workflow')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.invoice_number', 'INV-0001-2026');
            $this->getJson('/api/invoice-settings')->assertOk()->assertJsonPath('settings.series', '0051');
            $this->assertSame(3, DB::table('invoices')->count());
            $this->assertSame(3, DB::table('invoices')->distinct()->count('invoice_number'));
        } finally {
            Storage::disk('local')->deleteDirectory('invoice-logos');
            $this->app['auth']->forgetGuards();
            DB::purge('invoice_workflow');
            DB::setDefaultConnection($originalConnection);
            foreach (array_reverse($tables) as $table) {
                $connection->statement('DROP TABLE IF EXISTS `'.$prefix.$table.'`');
            }
        }
    }
}
