<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationMySqlTest extends TestCase
{
    public function test_registration_persists_in_mysql_and_rejects_duplicates(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run explicitly against the configured local MySQL database.');
        }
        DB::beginTransaction();
        try {
            $suffix = bin2hex(random_bytes(8));
            $payload = ['name' => 'Registration Integration Test', 'email' => "registration-{$suffix}@example.test", 'phone' => '+91 98765 43210', 'username' => "test-{$suffix}", 'password' => 'secure-password-123', 'terms' => true];
            $this->postJson('/api/register', $payload)->assertCreated()->assertJsonMissingPath('user.password');
            $user = User::where('email', $payload['email'])->firstOrFail();
            $this->assertTrue(Hash::check($payload['password'], $user->password));
            $this->assertSame($payload['phone'], $user->phone);
            $this->assertNotNull($user->terms_accepted_at);
            $this->postJson('/api/register', $payload)->assertUnprocessable()->assertJsonValidationErrors(['email', 'username']);
        } finally {
            DB::rollBack();
        }
    }
}
