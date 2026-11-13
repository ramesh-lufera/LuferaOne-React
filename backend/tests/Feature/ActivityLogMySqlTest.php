<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ActivityLogMySqlTest extends TestCase
{
    public function test_actual_mysql_authentication_and_listing_round_trip(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run explicitly against local MySQL.');
        }
        DB::beginTransaction();
        try {
            $suffix = bin2hex(random_bytes(8));
            $email = "audit-{$suffix}@example.test";
            $this->postJson('/api/register', ['name' => 'Audit Integration Test', 'email' => $email, 'username' => "audit-{$suffix}", 'phone' => '+91 98765 43210', 'password' => 'secure-password-123', 'terms' => true])->assertCreated();
            $user = User::where('email', $email)->firstOrFail();
            $this->artisan('users:set-role', ['email' => $email, 'role' => 'auditor'])->assertSuccessful();
            $login = $this->postJson('/api/login', ['email' => $email, 'password' => 'secure-password-123'])->assertOk();
            $token = $login->json('token');
            $query = http_build_query(['user' => 'id:'.$user->id, 'action' => 'Sign In']);
            $this->withToken($token)->getJson('/api/activity-logs?'.$query)->assertOk()->assertJsonPath('recordsFiltered', 1)->assertJsonPath('data.0.user_name', 'Audit Integration Test');
            $this->withToken($token)->getJson('/api/activity-logs/filters')->assertOk();
            $this->withToken($token)->postJson('/api/logout')->assertOk();
            $this->assertSame(3, ActivityLog::where('user_id', $user->id)->count());
            $this->assertDatabaseHas('activity_logs', ['action' => 'Sign Out', 'user_id' => $user->id]);
            $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
            $this->postJson('/api/login', ['email' => $email, 'password' => 'wrong'])->assertUnauthorized();
            $this->assertDatabaseHas('activity_logs', ['action' => 'Failed Sign In', 'user_id' => null, 'username' => $email]);
        } finally {
            DB::rollBack();
        }
    }
}
