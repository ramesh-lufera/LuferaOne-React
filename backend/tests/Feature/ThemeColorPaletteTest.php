<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Str;
use Tests\TestCase;

class ThemeColorPaletteTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(): array
    {
        return ['id' => (string) Str::uuid(), 'label' => 'Ocean', 'color' => '#123456', 'focus' => '#abcdef', 'text' => '#000000'];
    }

    public function test_public_theme_settings_expose_only_saved_colors_without_logging_reads(): void
    {
        $this->getJson('/api/theme-color-settings')->assertOk()->assertExactJson(['settings' => null]);
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $settings = ['palette_id' => 'blue', 'color' => '#487fff', 'focus' => '#bfdcff', 'text' => '#000000'];
        $this->putJson('/api/theme-color-palettes/settings', $settings)->assertOk();
        $before = ActivityLog::count();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/theme-color-settings')->assertOk()->assertExactJson([
            'settings' => ['color' => '#487fff', 'focus' => '#bfdcff', 'text' => '#000000'],
        ])->assertHeader('Cache-Control', 'no-store, private');
        $this->assertSame($before, ActivityLog::count());
    }

    public function test_palette_routes_require_module_access(): void
    {
        $this->getJson('/api/theme-color-palettes')->assertUnauthorized();
        $this->postJson('/api/theme-color-palettes', $this->payload())->assertUnauthorized();
        $this->postJson('/api/theme-color-palettes/activity', ['action' => 'Reset'])->assertUnauthorized();
        $this->putJson('/api/theme-color-palettes/settings', [])->assertUnauthorized();
        $id = (string) Str::uuid();
        $this->putJson('/api/theme-color-palettes/'.$id, $this->payload())->assertUnauthorized();
        $this->deleteJson('/api/theme-color-palettes/'.$id)->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/theme-color-palettes')->assertForbidden();
        $this->postJson('/api/theme-color-palettes', $this->payload())->assertForbidden();
        $this->postJson('/api/theme-color-palettes/activity', ['action' => 'Reset'])->assertForbidden();
        $this->putJson('/api/theme-color-palettes/settings', [])->assertForbidden();
        $this->putJson('/api/theme-color-palettes/'.$id, $this->payload())->assertForbidden();
        $this->deleteJson('/api/theme-color-palettes/'.$id)->assertForbidden();
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_saved_palettes_persist_in_order_and_retries_do_not_duplicate_them(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $first = $this->payload();
        $second = [...$this->payload(), 'label' => 'Forest'];
        $this->postJson('/api/theme-color-palettes', $first)->assertCreated()->assertJsonPath('palette', $first);
        $this->postJson('/api/theme-color-palettes', $first)->assertCreated();
        $this->postJson('/api/theme-color-palettes', $second)->assertCreated();
        $this->assertDatabaseCount('theme_color_palettes', 2);
        $this->assertSame(2, ActivityLog::where('module', 'Theme Colors')->where('action', 'Create')->count());
        $created = ActivityLog::where('entity_id', $first['id'])->firstOrFail();
        $this->assertSame($first, $created->metadata['palette']);
        $this->assertDatabaseHas('theme_color_palettes', ['uuid' => $first['id'], 'label' => 'Ocean', 'color' => '#123456']);
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->getJson('/api/theme-color-palettes')->assertOk()->assertExactJson(['palettes' => [$first, $second], 'settings' => null]);
        $this->assertDatabaseHas('activity_logs', ['module' => 'Theme Colors', 'action' => 'View']);
    }

    public function test_invalid_names_and_colors_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->postJson('/api/theme-color-palettes', [...$this->payload(), 'label' => ' ', 'color' => 'red', 'focus' => '#123', 'text' => 'bad'])
            ->assertUnprocessable()->assertJsonValidationErrors(['label', 'color', 'focus', 'text']);
        $this->assertDatabaseCount('theme_color_palettes', 0);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_module_interactions_are_logged_and_available_in_activity_filters(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user, 'sanctum');
        $actions = [
            'Select Color', 'Edit Custom Color', 'Reset', 'Open Add Color', 'Cancel Add Color',
            'Open Edit Color', 'Cancel Edit Color', 'Open Delete Color', 'Cancel Delete Color',
        ];
        foreach ($actions as $action) {
            $this->postJson('/api/theme-color-palettes/activity', [
                'action' => $action, 'palette_id' => 'blue', 'palette_name' => 'Blue', 'field' => 'main', 'color' => '#123456',
            ])->assertOk();
            $this->assertDatabaseHas('activity_logs', ['module' => 'Theme Colors', 'action' => $action, 'user_id' => $user->id]);
        }
        $this->assertDatabaseCount('activity_logs', count($actions));
        $this->assertSame('Blue', ActivityLog::firstOrFail()->metadata['palette_name']);
        app(ActivityLogger::class)->record($user, 'View', 'Theme Color Palettes');
        $this->getJson('/api/activity-logs?module=Theme%20Colors&action=View')->assertOk()
            ->assertJsonPath('data.0.description', 'View in Theme Colors');
        $this->getJson('/api/activity-logs?module=Theme%20Colors')->assertOk()->assertJsonPath('recordsFiltered', count($actions) + 1);
        $this->getJson('/api/activity-logs/filters')->assertOk()->assertJsonPath('modules.0', 'Theme Colors');
        $this->postJson('/api/theme-color-palettes/activity', ['action' => 'Delete', 'color' => 'bad'])->assertUnprocessable();
        $this->postJson('/api/theme-color-palettes/activity', ['action' => 'Save Changes'])->assertUnprocessable();
        $this->assertDatabaseCount('activity_logs', count($actions) + 1);
    }

    public function test_palette_creation_rolls_back_when_activity_logging_fails(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->mock(ActivityLogger::class, function ($mock): void {
            $mock->shouldReceive('record')->once()->andThrow(new \RuntimeException('Log storage unavailable'));
        });
        $this->postJson('/api/theme-color-palettes', $this->payload())->assertServerError();
        $this->assertDatabaseCount('theme_color_palettes', 0);
    }

    public function test_page_color_settings_persist_and_update_with_activity_history(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $preset = ['palette_id' => 'blue', 'color' => '#487fff', 'focus' => '#bfdcff', 'text' => '#000000'];
        $this->putJson('/api/theme-color-palettes/settings', $preset)->assertOk()->assertJsonPath('settings', $preset);
        $this->getJson('/api/theme-color-palettes')->assertOk()->assertJsonPath('settings', $preset);
        $custom = ['palette_id' => 'custom', 'color' => '#abcdef', 'focus' => '#123456', 'text' => '#010203'];
        $this->putJson('/api/theme-color-palettes/settings', $custom)->assertOk();
        $this->assertDatabaseCount('theme_color_settings', 1);
        $this->assertDatabaseHas('theme_color_settings', $custom);
        $this->getJson('/api/theme-color-palettes')->assertOk()->assertJsonPath('settings', $custom);
        $log = ActivityLog::where('action', 'Save Changes')->latest('id')->firstOrFail();
        $this->assertSame($preset, $log->metadata['before']);
        $this->assertSame($custom, $log->metadata['after']);
        $saved = $this->payload();
        $this->postJson('/api/theme-color-palettes', $saved)->assertCreated();
        $this->putJson('/api/theme-color-palettes/settings', [...$custom, 'palette_id' => $saved['id']])->assertOk();
        $this->putJson('/api/theme-color-palettes/settings', [...$custom, 'color' => 'red', 'palette_id' => 'missing'])
            ->assertUnprocessable()->assertJsonValidationErrors(['color', 'palette_id']);
        $this->assertDatabaseHas('theme_color_settings', ['palette_id' => $saved['id']]);
    }

    public function test_page_color_save_rolls_back_when_activity_logging_fails(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->mock(ActivityLogger::class, function ($mock): void {
            $mock->shouldReceive('record')->once()->andThrow(new \RuntimeException('Log storage unavailable'));
        });
        $this->putJson('/api/theme-color-palettes/settings', [
            'palette_id' => 'blue', 'color' => '#487fff', 'focus' => '#bfdcff', 'text' => '#000000',
        ])->assertServerError();
        $this->assertDatabaseCount('theme_color_settings', 0);
    }

    public function test_added_palettes_can_be_edited_and_deleted_with_database_and_activity_updates(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $palette = $this->payload();
        $this->postJson('/api/theme-color-palettes', $palette)->assertCreated();
        $settings = ['palette_id' => $palette['id'], 'color' => $palette['color'], 'focus' => $palette['focus'], 'text' => $palette['text']];
        $this->putJson('/api/theme-color-palettes/settings', $settings)->assertOk();
        $updated = [...$palette, 'label' => 'Edited Ocean', 'color' => '#112233'];
        $this->putJson('/api/theme-color-palettes/'.$palette['id'], $updated)->assertOk()->assertJsonPath('palette', $updated);
        $this->assertDatabaseHas('theme_color_palettes', ['uuid' => $palette['id'], 'label' => 'Edited Ocean', 'color' => '#112233']);
        $this->getJson('/api/theme-color-palettes')->assertOk()->assertJsonPath('palettes.0', $updated)->assertJsonPath('settings', $settings);
        $this->assertDatabaseHas('activity_logs', ['module' => 'Theme Colors', 'action' => 'Update', 'entity_id' => $palette['id']]);
        $this->deleteJson('/api/theme-color-palettes/'.$palette['id'])->assertOk()->assertJsonPath('settings', [...$settings, 'palette_id' => 'custom']);
        $this->assertDatabaseCount('theme_color_palettes', 0);
        $this->assertDatabaseHas('theme_color_settings', [...$settings, 'palette_id' => 'custom']);
        $this->assertDatabaseHas('activity_logs', ['module' => 'Theme Colors', 'action' => 'Delete', 'entity_id' => $palette['id']]);
        $this->getJson('/api/theme-color-palettes')->assertOk()->assertJsonCount(0, 'palettes');
    }

    public function test_presets_and_missing_palettes_cannot_be_modified_and_invalid_edits_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        foreach (['blue', 'lufera-infotech', (string) Str::uuid()] as $id) {
            $this->putJson('/api/theme-color-palettes/'.$id, $this->payload())->assertNotFound();
            $this->deleteJson('/api/theme-color-palettes/'.$id)->assertNotFound();
        }
        $palette = $this->payload();
        $this->postJson('/api/theme-color-palettes', $palette)->assertCreated();
        $this->putJson('/api/theme-color-palettes/'.$palette['id'], [...$palette, 'label' => '', 'color' => 'invalid'])
            ->assertUnprocessable()->assertJsonValidationErrors(['label', 'color']);
        $this->assertDatabaseHas('theme_color_palettes', ['uuid' => $palette['id'], 'label' => $palette['label'], 'color' => $palette['color']]);
        $this->assertDatabaseCount('activity_logs', 1);
    }

    public function test_edit_and_delete_are_rolled_back_if_logging_fails(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $palette = $this->payload();
        $this->postJson('/api/theme-color-palettes', $palette)->assertCreated();
        $settings = ['palette_id' => $palette['id'], 'color' => $palette['color'], 'focus' => $palette['focus'], 'text' => $palette['text']];
        $this->putJson('/api/theme-color-palettes/settings', $settings)->assertOk();
        $this->mock(ActivityLogger::class, function ($mock): void {
            $mock->shouldReceive('record')->twice()->andThrow(new \RuntimeException('Log storage unavailable'));
        });
        $this->putJson('/api/theme-color-palettes/'.$palette['id'], [...$palette, 'label' => 'Should roll back'])->assertServerError();
        $this->deleteJson('/api/theme-color-palettes/'.$palette['id'])->assertServerError();
        $this->assertDatabaseHas('theme_color_palettes', ['uuid' => $palette['id'], 'label' => $palette['label']]);
        $this->assertDatabaseHas('theme_color_settings', $settings);
    }
}
