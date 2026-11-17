<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CompanyMySqlTest extends TestCase
{
    public function test_company_profile_round_trip_in_mysql_is_rolled_back(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run explicitly against local MySQL.');
        }
        DB::beginTransaction();
        try {
            $user = User::factory()->create(['role' => 'admin']);
            $existing = Company::where('profile_key', 'shared')->first();
            $payload = ['full_name' => 'Company Integration Test', 'email' => 'company-test@example.test', 'phone_country_code' => '+91', 'phone_number' => '8680808204', 'website' => '',
                'country' => 'India', 'city' => 'Trichy', 'state' => 'Tamil Nadu', 'zip_code' => '620001', 'address' => 'Test address', 'gstin' => '33AEZPA0582L1Z7'];
            $this->actingAs($user, 'sanctum');
            $response = $existing ? $this->putJson('/api/company', $payload)->assertOk() : $this->postJson('/api/company', $payload)->assertCreated();
            $id = $response->json('company.id');
            $this->getJson('/api/company')->assertOk()->assertJsonPath('company.full_name', 'Company Integration Test')->assertJsonPath('company.id', $id);
            $this->assertDatabaseHas('activity_logs', ['action' => $existing ? 'Update' : 'Create', 'module' => 'Company', 'entity_id' => (string) $id, 'user_id' => $user->id]);
            $query = http_build_query(['module' => 'Company', 'user' => 'id:'.$user->id]);
            $this->getJson('/api/activity-logs?'.$query)->assertOk()->assertJsonPath('recordsFiltered', 2);
        } finally {
            DB::rollBack();
        }
    }
}
