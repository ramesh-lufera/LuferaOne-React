<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TaxTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(array $overrides = []): array
    {
        return array_replace(['name' => 'GST 18%', 'rate' => '18.00', 'type' => 'exclusive'], $overrides);
    }

    public function test_tax_routes_require_authentication_and_module_access(): void
    {
        $this->getJson('/api/taxes')->assertUnauthorized();
        $this->postJson('/api/taxes', $this->payload())->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/taxes')->assertForbidden();
        $this->getJson('/api/taxes/1')->assertForbidden();
        $this->postJson('/api/taxes', $this->payload())->assertForbidden();
        $this->putJson('/api/taxes/1', $this->payload())->assertForbidden();
        $this->deleteJson('/api/taxes/1')->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['taxes'])]);
        $this->getJson('/api/taxes')->assertOk();
    }

    public function test_tax_records_can_be_saved_viewed_edited_and_deleted(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $id = $this->postJson('/api/taxes', $this->payload())->assertCreated()->json('id');
        $this->getJson('/api/taxes/'.$id)->assertOk()->assertJsonPath('tax.rate', '18.00');
        $this->putJson('/api/taxes/'.$id, $this->payload(['name' => 'GST included', 'rate' => '12.50', 'type' => 'inclusive']))->assertOk();
        $this->getJson('/api/taxes?search=GST')->assertOk()->assertJsonPath('data.0.name', 'GST included')
            ->assertJsonPath('data.0.rate', '12.50')->assertJsonPath('data.0.type', 'inclusive')
            ->assertJsonMissingPath('data.0.default_region');
        $this->deleteJson('/api/taxes/'.$id)->assertOk();
        $this->assertDatabaseCount('taxes', 0);
        $this->getJson('/api/taxes/'.$id)->assertNotFound();
        $this->putJson('/api/taxes/'.$id, $this->payload())->assertNotFound();
        $this->deleteJson('/api/taxes/'.$id)->assertNotFound();
    }

    public function test_removed_fields_do_not_affect_other_tax_records(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $first = $this->postJson('/api/taxes', $this->payload(['name' => 'First tax', 'region' => 'India', 'is_default' => true]))->assertCreated()->json('id');
        $this->postJson('/api/taxes', $this->payload(['name' => 'Second tax']))->assertCreated();
        $this->getJson('/api/taxes/'.$first)->assertOk()->assertJsonPath('tax.name', 'First tax')
            ->assertJsonMissingPath('tax.region')->assertJsonMissingPath('tax.is_default');
    }

    public function test_validation_rejects_invalid_fields_and_preserves_existing_tax(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $id = $this->postJson('/api/taxes', $this->payload())->assertCreated()->json('id');
        $this->postJson('/api/taxes', $this->payload(['name' => '', 'rate' => -1, 'type' => 'invalid']))
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'rate', 'type']);
        foreach (['100.01', '18.001', 'text'] as $rate) {
            $this->putJson('/api/taxes/'.$id, $this->payload(['rate' => $rate]))->assertUnprocessable()->assertJsonValidationErrors('rate');
        }
        $this->getJson('/api/taxes/'.$id)->assertJsonPath('tax.rate', '18.00');
        $this->assertDatabaseCount('taxes', 1);
        $this->postJson('/api/taxes', $this->payload(['rate' => '0']))->assertCreated();
        $this->postJson('/api/taxes', $this->payload(['rate' => '100']))->assertCreated();
    }

    public function test_tax_listing_search_and_pagination(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        for ($index = 1; $index <= 11; $index++) {
            $this->postJson('/api/taxes', $this->payload(['name' => 'Regional tax '.$index]))->assertCreated();
        }
        $this->getJson('/api/taxes?search=Regional&per_page=10&page=2')->assertOk()
            ->assertJsonPath('total', 11)->assertJsonPath('from', 11)->assertJsonCount(1, 'data');
        $this->getJson('/api/taxes?search=exclusive')->assertOk()->assertJsonPath('total', 11);
        $this->getJson('/api/taxes?search=missing')->assertOk()->assertJsonPath('total', 0);
        $this->getJson('/api/taxes?per_page=500')->assertUnprocessable();
    }
}
