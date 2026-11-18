<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileWorkflowMySqlTest extends TestCase
{
    public function test_authenticated_profile_workflow_persists_in_mysql(): void
    {
        if (getenv('PROFILE_MYSQL_INTEGRATION') !== '1' || DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run explicitly against local MySQL using isolated table copies.');
        }
        $connection = DB::connection();
        $originalConnection = DB::getDefaultConnection();
        $prefix = 'profile_workflow_'.bin2hex(random_bytes(6)).'_';
        $configuration = $connection->getConfig();
        $configuration['prefix'] = $prefix;
        $configuration['name'] = 'profile_workflow';
        config(['database.connections.profile_workflow' => $configuration]);
        $tables = ['roles', 'users', 'user_details', 'personal_access_tokens', 'sessions', 'activity_logs'];
        Storage::fake('local');
        try {
            foreach ($tables as $table) {
                $connection->statement('CREATE TABLE `'.$prefix.$table.'` LIKE `'.$connection->getTablePrefix().$table.'`');
            }
            DB::setDefaultConnection('profile_workflow');
            $user = User::factory()->connection('profile_workflow')->create(['password' => 'Current-Password-123!']);
            $token = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'Current-Password-123!'])->assertOk()->json('token');
            $this->withToken($token);
            $this->getJson('/api/profile')->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonPath('user.user_code', $user->user_code);
            $image = fn () => UploadedFile::fake()->createWithContent('image.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
            $payload = ['_method' => 'PUT', 'name' => 'Updated Profile', 'email' => $user->email, 'username' => 'profile.user', 'business_name' => 'Test Business', 'phone' => '+91 9876543210', 'profile_image' => $image(), 'cover_image' => $image()];
            $this->post('/api/profile', $payload, ['Accept' => 'application/json'])->assertOk()->assertJsonPath('user.name', 'Updated Profile');
            $profile = $this->getJson('/api/profile')->assertOk()->assertJsonPath('user.business_name', 'Test Business')->json('user');
            $this->get($profile['profile_image_url'])->assertOk();
            $this->get($profile['cover_image_url'])->assertOk();
            $details = DB::table('user_details')->where('user_id', $user->id)->first();
            Storage::disk('local')->assertExists([$details->profile_image_path, $details->cover_image_path]);
            $this->putJson('/api/profile/password', ['current_password' => 'wrong', 'password' => 'New-Password-123!', 'password_confirmation' => 'New-Password-123!'])->assertUnprocessable()->assertJsonValidationErrors('current_password');
            $this->putJson('/api/profile/password', ['current_password' => 'Current-Password-123!', 'password' => 'New-Password-123!', 'password_confirmation' => 'New-Password-123!'])->assertOk();
            $this->assertTrue(Hash::check('New-Password-123!', User::on('profile_workflow')->findOrFail($user->id)->password));
            $this->app['auth']->forgetGuards();
            $this->withToken($token)->getJson('/api/profile')->assertOk()->assertJsonPath('user.username', 'profile.user');
            $this->app['auth']->forgetGuards();
            $this->withHeader('Authorization', '');
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'Current-Password-123!'])->assertUnauthorized();
            $this->app['auth']->forgetGuards();
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'New-Password-123!'])->assertOk();
            $this->assertSame(1, DB::table('users')->count());
        } finally {
            Storage::disk('local')->deleteDirectory('users');
            $this->app['auth']->forgetGuards();
            DB::purge('profile_workflow');
            DB::setDefaultConnection($originalConnection);
            foreach (array_reverse($tables) as $table) {
                $connection->statement('DROP TABLE IF EXISTS `'.$prefix.$table.'`');
            }
        }
    }
}
