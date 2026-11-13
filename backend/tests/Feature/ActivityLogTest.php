<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->role = 'admin';
        $user->save();

        return $user;
    }

    private function registration(): array
    {
        return ['name' => 'Actual Actor', 'email' => 'actor@example.test', 'username' => 'actor', 'phone' => '+91 98765 43210', 'password' => 'secure-password-123', 'terms' => true];
    }

    public function test_authentication_activities_use_server_identity_and_no_secrets(): void
    {
        $this->postJson('/api/register', $this->registration() + ['role' => 'admin', 'user_id' => 999, 'occurred_at' => '2000-01-01'])->assertCreated();
        $user = User::where('email', 'actor@example.test')->firstOrFail();
        $this->assertSame('user', $user->role);
        $this->assertDatabaseHas('activity_logs', ['action' => 'Sign Up', 'user_id' => $user->id, 'user_name' => 'Actual Actor']);
        $response = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'secure-password-123'])->assertOk();
        $this->withToken($response->json('token'))->getJson('/api/user')->assertOk();
        $this->withToken($response->json('token'))->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseCount('activity_logs', 3);
        $this->assertDatabaseHas('activity_logs', ['action' => 'Sign Out', 'user_id' => $user->id]);
        $this->assertStringNotContainsString('secure-password', ActivityLog::all()->toJson());
    }

    public function test_failed_sign_in_keeps_email_without_claiming_authenticated_user(): void
    {
        User::factory()->create(['email' => 'known@example.test']);
        foreach (['known@example.test', 'unknown@example.test'] as $email) {
            $this->postJson('/api/login', ['email' => $email, 'password' => 'wrong', 'user_id' => 999])->assertUnauthorized();
            $this->assertDatabaseHas('activity_logs', ['action' => 'Failed Sign In', 'user_id' => null, 'username' => $email]);
        }
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseCount('activity_logs', 2);
    }

    public function test_invalid_requests_and_auth_checks_do_not_generate_artificial_activities(): void
    {
        $this->postJson('/api/register', [])->assertUnprocessable();
        $this->postJson('/api/login', [])->assertUnprocessable();
        $this->getJson('/api/health')->assertOk();
        $this->actingAs($this->admin(), 'sanctum')->getJson('/api/user')->assertOk();
        $this->getJson('/api/activity-logs')->assertOk();
        $this->getJson('/api/activity-logs/filters')->assertOk();
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_any_authenticated_user_can_read_all_logs_but_cannot_modify_them(): void
    {
        $this->getJson('/api/activity-logs')->assertUnauthorized();
        $this->getJson('/api/activity-logs/filters')->assertUnauthorized();
        $user = User::factory()->create();
        $other = User::factory()->create();
        app(ActivityLogger::class)->record($other, 'Sign In', 'Authentication');
        $this->actingAs($user, 'sanctum')->getJson('/api/activity-logs')->assertOk()
            ->assertJsonPath('recordsFiltered', 1)->assertJsonPath('data.0.user_id', $other->id);
        $this->getJson('/api/activity-logs/filters')->assertOk();
        foreach (['user' => true, 'admin' => true, 'auditor' => true] as $role => $allowed) {
            $user->role = $role;
            $this->assertSame($allowed, Gate::forUser($user)->allows('view-activity-logs'));
        }
        $this->getJson('/api/activity-logs')->assertOk();
        $this->postJson('/api/activity-logs', [])->assertMethodNotAllowed();
        $this->deleteJson('/api/activity-logs/1')->assertNotFound();
    }

    public function test_page_names_are_used_for_new_and_legacy_authentication_events(): void
    {
        $this->postJson('/api/register', $this->registration())->assertCreated();
        $this->assertDatabaseHas('activity_logs', ['action' => 'Sign Up', 'module' => 'Sign Up']);
        $actor = $this->admin();
        $legacy = app(ActivityLogger::class)->record($actor, 'Sign In', 'Authentication', '2');
        $query = http_build_query(['module' => 'Sign In', 'search' => ['value' => 'Sign In']]);
        $this->actingAs($actor, 'sanctum')->getJson('/api/activity-logs?'.$query)->assertOk()
            ->assertJsonPath('recordsFiltered', 1)->assertJsonPath('data.0.module', 'Sign In')
            ->assertJsonPath('data.0.description', 'Sign In in Sign In');
        $this->getJson('/api/activity-logs/filters')->assertOk()->assertJsonPath('modules.0', 'Sign In')->assertJsonPath('modules.1', 'Sign Up');
        $this->assertSame('Authentication', $legacy->fresh()->module);
        $this->assertSame('Sign In in Authentication (record 2)', $legacy->fresh()->description);
        $this->assertSame('2', $legacy->fresh()->entity_id);
        $search = http_build_query(['search' => ['value' => 'in Sign In']]);
        $this->getJson('/api/activity-logs?'.$search)->assertOk()->assertJsonPath('recordsFiltered', 1);
    }

    public function test_filters_sorting_pagination_and_timezone_boundaries(): void
    {
        $admin = $this->admin();
        $logger = app(ActivityLogger::class);
        $this->travelTo('2026-11-12 18:29:59');
        $logger->record($admin, 'Update', 'Users', '1');
        $this->travelTo('2026-11-12 18:30:00');
        $logger->record($admin, 'Update', 'Users', '2');
        $this->travelTo('2026-11-13 18:29:59');
        $second = $logger->record($admin, 'Update', 'Users', '3');
        $this->travelTo('2026-11-13 18:30:00');
        $logger->record($admin, 'Update', 'Users', '4');
        $query = http_build_query(['draw' => 7, 'length' => 1, 'start' => 1, 'module' => 'Users', 'action' => 'Update', 'user' => 'id:'.$admin->id,
            'date_from' => '2026-11-13', 'date_to' => '2026-11-13', 'search' => ['value' => 'record'], 'order' => [['column' => 5, 'dir' => 'asc']]]);
        $this->actingAs($admin, 'sanctum')->getJson('/api/activity-logs?'.$query)->assertOk()->assertJsonPath('draw', 7)
            ->assertJsonPath('recordsFiltered', 2)->assertJsonPath('data.0.id', $second->id)->assertJsonPath('data.0.serial', 2)
            ->assertJsonPath('data.0.date_time', '13 Nov 2026 23:59:59')->assertJsonPath('data.0.date', '13 Nov 2026')->assertJsonPath('data.0.time', '23:59:59');
        $this->getJson('/api/activity-logs?date_to=2026-11-12')->assertOk()->assertJsonPath('recordsFiltered', 1);
        $this->getJson('/api/activity-logs?search[value]=nonexistent')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/activity-logs/filters')->assertOk()->assertJsonPath('users.0.value', 'id:'.$admin->id);
    }

    public function test_unauthenticated_identifiers_are_filterable(): void
    {
        app(ActivityLogger::class)->record(null, 'Failed Sign In', 'Authentication', identifier: 'unknown@example.test');
        $query = http_build_query(['user' => 'unknown@example.test']);
        $this->actingAs($this->admin(), 'sanctum')->getJson('/api/activity-logs?'.$query)->assertOk()->assertJsonPath('recordsFiltered', 1)->assertJsonPath('data.0.user_id', null);
    }

    public function test_invalid_filters_and_sort_injection_are_rejected(): void
    {
        $this->actingAs($this->admin(), 'sanctum');
        foreach (['length' => -1, 'start' => -1, 'order[0][column]' => 'password', 'order[0][dir]' => 'DROP TABLE', 'date_from' => 'bad'] as $key => $value) {
            $this->getJson('/api/activity-logs?'.http_build_query([$key => $value]))->assertUnprocessable();
        }
    }

    public function test_future_functional_api_operations_are_automatically_tracked(): void
    {
        Route::middleware(['api', 'auth:sanctum'])->post('/api/projects', function (Request $request) {
            $user = User::factory()->create();
            $request->attributes->set('activity_entity_id', $user->id);

            return response()->json(['id' => $user->id], 201);
        });
        Route::middleware(['api', 'auth:sanctum'])->patch('/api/projects/{id}', function (string $id) {
            User::findOrFail($id)->update(['name' => 'Changed']);

            return response()->json(['message' => 'Saved']);
        });
        Route::middleware(['api', 'auth:sanctum'])->get('/api/projects/{id}', fn () => response()->json(['message' => 'Viewed']));
        Route::middleware(['api', 'auth:sanctum'])->delete('/api/projects/{id}', function (string $id) {
            User::findOrFail($id)->delete();

            return response()->noContent();
        });
        $actor = $this->admin();
        $result = $this->actingAs($actor, 'sanctum')->postJson('/api/projects')->assertCreated();
        $id = $result->json('id');
        $this->patchJson('/api/projects/'.$id)->assertOk();
        $this->getJson('/api/projects/'.$id)->assertOk();
        $this->deleteJson('/api/projects/'.$id)->assertNoContent();
        $this->patchJson('/api/projects/99999')->assertNotFound();
        $this->assertDatabaseCount('activity_logs', 4);
        foreach (['Create', 'Update', 'View', 'Delete'] as $action) {
            $this->assertDatabaseHas('activity_logs', ['action' => $action, 'module' => 'Projects', 'user_id' => $actor->id, 'entity_id' => (string) $id]);
        }
    }

    public function test_storage_failure_rolls_back_registration(): void
    {
        Schema::drop('activity_logs');
        $this->postJson('/api/register', $this->registration())->assertServerError();
        $this->assertDatabaseMissing('users', ['email' => 'actor@example.test']);
    }

    public function test_failed_database_operation_has_no_success_log(): void
    {
        Route::middleware(['api', 'auth:sanctum'])->post('/api/projects', function () {
            User::factory()->create(['email' => 'duplicate@example.test']);
            User::factory()->create(['email' => 'duplicate@example.test']);
        });
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/projects')->assertServerError();
        $this->assertDatabaseMissing('users', ['email' => 'duplicate@example.test']);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_event_ids_are_deduplicated_and_log_updates_are_rejected(): void
    {
        $logger = app(ActivityLogger::class);
        $log = $logger->record($this->admin(), 'Create', 'Users');
        $again = $logger->record(null, 'Create', 'Users', eventId: $log->event_id);
        $this->assertSame($log->id, $again->id);
        $this->assertDatabaseCount('activity_logs', 1);
        $this->expectException(\LogicException::class);
        $log->forceFill(['action' => 'Delete'])->save();
    }

    public function test_log_deletion_is_rejected(): void
    {
        $log = app(ActivityLogger::class)->record($this->admin(), 'Create', 'Users');
        $this->expectException(\LogicException::class);
        $log->delete();
    }

    public function test_console_roles_are_audited_and_invalid_roles_rejected(): void
    {
        $user = User::factory()->create();
        $this->artisan('users:set-role', ['email' => $user->email, 'role' => 'auditor'])->assertSuccessful();
        $this->assertSame('auditor', $user->fresh()->role);
        $this->assertDatabaseHas('activity_logs', ['module' => 'Roles', 'action' => 'Update', 'entity_id' => (string) $user->id, 'user_id' => null]);
        $this->artisan('users:set-role', ['email' => $user->email, 'role' => 'root'])->assertFailed();
        $this->assertDatabaseCount('activity_logs', 1);
    }
}
