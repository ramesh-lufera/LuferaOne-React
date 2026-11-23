<?php

namespace Tests\Feature;

use App\Models\Sheet;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SheetTest extends TestCase
{
    use DatabaseMigrations;

    public function test_import_creates_a_new_sheet_with_headers_and_content_and_requires_access(): void
    {
        $content = ['headers' => ['Tasks', 'Client', 'Amount', 'Notes', 'Status', 'Owner'], 'rows' => [[['value' => '', 'rowId' => 'import-a'], ['value' => 'Client A'], ['value' => '10'], ['value' => 'Review'], ['value' => 'Open'], ['value' => 'Alice']]]];
        $this->postJson('/api/sheets/import', ['name' => 'Budget', 'content' => $content])->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum')->postJson('/api/sheets/import', ['name' => 'Budget', 'content' => $content])->assertForbidden();
        $actor = User::factory()->create(['role' => 'admin']);
        $this->actingAs($actor, 'sanctum');
        $existing = Sheet::factory()->create(['name' => 'Original']);
        $id = $this->postJson('/api/sheets/import', ['name' => ' Budget ', 'content' => $content])->assertCreated()->assertJsonPath('sheet.name', 'Budget')->json('sheet.id');
        $this->getJson('/api/sheets/'.$id)->assertOk()->assertJsonPath('sheet.content.headers.1', 'Client')->assertJsonPath('sheet.content.rows.0.5.value', 'Alice');
        $this->assertDatabaseHas('sheets', ['id' => $id, 'created_by' => $actor->id]);
        $this->assertSame('Original', $existing->fresh()->name);
        $this->assertNull($existing->fresh()->content);
        $this->putJson('/api/sheets/'.$id, ['version' => 0, 'content' => $content])->assertOk()->assertJsonPath('sheet.content.headers.1', 'Client');
        $this->postJson('/api/sheets/import', ['name' => '   ', 'content' => $content])->assertUnprocessable();
        $content['rows'] = array_fill(0, 201, $content['rows'][0]);
        $this->postJson('/api/sheets/import', ['name' => 'Too large', 'content' => $content])->assertUnprocessable();
        $this->assertDatabaseCount('sheets', 2);
    }

    public function test_row_locks_and_reminders_persist_and_locked_rows_require_unlocking_before_edit_or_delete(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = Sheet::factory()->create();
        $rows = [array_fill(0, 4, ['value' => 'Task A']), array_fill(0, 4, ['value' => 'Task B'])];
        $rows[0][0] = ['value' => '', 'rowId' => 'task-a', 'locked' => true, 'reminderAt' => '2026-12-01T12:00:00.000Z', 'reminderNote' => 'Review task'];
        $rows[1][0] = ['value' => '', 'rowId' => 'task-b'];
        $endpoint = '/api/sheets/'.$sheet->id;
        $this->putJson($endpoint, ['version' => 0, 'content' => ['rows' => $rows]])->assertOk();
        $this->getJson($endpoint)->assertOk()->assertJsonPath('sheet.content.rows.0.0.locked', true)->assertJsonPath('sheet.content.rows.0.0.reminderNote', 'Review task');
        $edited = $rows;
        $edited[0][1]['value'] = 'Changed';
        $this->putJson($endpoint, ['version' => 1, 'content' => ['rows' => $edited]])->assertUnprocessable();
        $this->putJson($endpoint, ['version' => 1, 'content' => ['rows' => [$rows[1]]]])->assertUnprocessable();
        $edited = $rows;
        $edited[0][0]['locked'] = false;
        $this->putJson($endpoint, ['version' => 1, 'content' => ['rows' => $edited]])->assertOk();
        $edited[0][1]['value'] = 'Changed';
        $this->putJson($endpoint, ['version' => 2, 'content' => ['rows' => $edited]])->assertOk();
        $this->putJson($endpoint, ['version' => 3, 'content' => ['rows' => [$rows[1]]]])->assertOk();
    }

    public function test_row_metadata_rejects_invalid_reminders_and_duplicate_row_identifiers(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = Sheet::factory()->create();
        $row = array_fill(0, 4, ['value' => '']);
        $row[0]['rowId'] = 'task-a';
        foreach ([['reminderAt' => 'invalid'], ['reminderNote' => str_repeat('x', 1001)], ['locked' => 'invalid']] as $metadata) {
            $invalid = $row;
            $invalid[0] = [...$invalid[0], ...$metadata];
            $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => [$invalid]]])->assertUnprocessable();
        }
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => [$row, $row]]])->assertUnprocessable();
    }

    public function test_sheet_can_be_renamed_without_changing_its_cells_and_deleted(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = Sheet::factory()->create(['content' => ['rows' => [array_fill(0, 4, ['value' => 'Keep'])]]]);
        $other = Sheet::factory()->create();
        $this->patchJson('/api/sheets/'.$sheet->id, ['name' => '   '])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->patchJson('/api/sheets/'.$sheet->id, ['name' => ' Budget ', 'content' => null])->assertOk()->assertJsonPath('sheet.name', 'Budget');
        $this->assertSame('Keep', $sheet->fresh()->content['rows'][0][0]['value']);
        $this->deleteJson('/api/sheets/'.$sheet->id)->assertOk();
        $this->assertDatabaseMissing('sheets', ['id' => $sheet->id]);
        $this->assertDatabaseHas('sheets', ['id' => $other->id]);
        $this->patchJson('/api/sheets/'.$sheet->id, ['name' => 'Missing'])->assertNotFound();
        $this->deleteJson('/api/sheets/'.$sheet->id)->assertNotFound();
    }

    public function test_new_four_column_sheets_can_be_saved(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = Sheet::factory()->create();
        $rows = [array_fill(0, 4, ['value' => 'Task'])];
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => $rows]])->assertOk()->assertJsonCount(4, 'sheet.content.rows.0');
    }

    public function test_sheet_list_and_creation_require_authentication_and_module_permission(): void
    {
        $this->getJson('/api/sheets')->assertUnauthorized();
        $this->postJson('/api/sheets', ['name' => 'Sales'])->assertUnauthorized();
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')->getJson('/api/sheets')->assertForbidden();
        $this->postJson('/api/sheets', ['name' => 'Sales'])->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['sheets'])]);
        $this->postJson('/api/sheets', ['name' => 'Sales'])->assertCreated();
        $this->getJson('/api/sheets')->assertOk()->assertJsonPath('total', 1);
    }

    public function test_created_sheet_reloads_with_trimmed_name_and_server_owned_creator(): void
    {
        $actor = User::factory()->create(['role' => 'admin']);
        $this->actingAs($actor, 'sanctum');
        $response = $this->postJson('/api/sheets', ['name' => '  Sales 2026  ', 'created_by' => 999])->assertCreated()->assertJsonPath('sheet.name', 'Sales 2026');
        $id = $response->json('sheet.id');
        $this->assertDatabaseHas('sheets', ['id' => $id, 'name' => 'Sales 2026', 'created_by' => $actor->id]);
        $this->getJson('/api/sheets')->assertOk()->assertJsonPath('data.0.id', $id)->assertJsonPath('data.0.name', 'Sales 2026');
        $this->assertDatabaseHas('activity_logs', ['module' => 'Sheets', 'action' => 'Create', 'entity_id' => (string) $id]);
        $this->assertDatabaseCount('activity_logs', 1);
    }

    public function test_search_pagination_and_invalid_parameters(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        Sheet::factory()->count(12)->create(['name' => 'Sales']);
        Sheet::factory()->create(['name' => 'Inventory']);
        $this->getJson('/api/sheets?search=Sales&per_page=10&page=2')->assertOk()->assertJsonPath('total', 12)->assertJsonCount(2, 'data')->assertJsonPath('from', 11);
        $this->getJson('/api/sheets?search=Missing')->assertOk()->assertJsonPath('total', 0);
        $this->getJson('/api/sheets?per_page=999')->assertUnprocessable();
        $this->getJson('/api/sheets?page=0')->assertUnprocessable();
    }

    public function test_missing_blank_or_oversized_names_cannot_create_sheets(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        foreach (['', '   ', str_repeat('x', 256), ['invalid']] as $name) {
            $this->postJson('/api/sheets', ['name' => $name])->assertUnprocessable()->assertJsonValidationErrors('name');
        }
        $this->assertDatabaseCount('sheets', 0);
        $this->assertDatabaseCount('activity_logs', 0);
    }

    public function test_sheet_content_and_formatting_save_to_the_correct_record_and_reject_stale_edits(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = Sheet::factory()->create();
        $other = Sheet::factory()->create();
        $rows = [array_fill(0, 5, ['value' => ''])];
        $rows[0][1] = ['value' => 'Alice', 'bold' => true, 'color' => '#8252e9'];
        $this->getJson('/api/sheets/'.$sheet->id)->assertOk()->assertJsonPath('sheet.id', $sheet->id);
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => $rows, 'columnWidths' => [180, 380, 260, 260, 260]]])->assertOk()->assertJsonPath('sheet.version', 1);
        $this->getJson('/api/sheets/'.$sheet->id)->assertJsonPath('sheet.content.rows.0.1.value', 'Alice')->assertJsonPath('sheet.content.rows.0.1.bold', true)->assertJsonPath('sheet.content.columnWidths.1', 380);
        $this->assertNull($other->fresh()->content);
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => $rows]])->assertConflict();
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 1, 'content' => ['rows' => $rows, 'columnWidths' => [10]]])->assertUnprocessable();
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 1, 'content' => ['rows' => [[]]]])->assertUnprocessable();
        $this->getJson('/api/sheets/99999')->assertNotFound();
    }

    public function test_editor_endpoints_require_the_sheets_permission(): void
    {
        $sheet = Sheet::factory()->create();
        $this->getJson('/api/sheets/'.$sheet->id)->assertUnauthorized();
        $this->putJson('/api/sheets/'.$sheet->id, [])->assertUnauthorized();
        $this->patchJson('/api/sheets/'.$sheet->id, ['name' => 'Budget'])->assertUnauthorized();
        $this->deleteJson('/api/sheets/'.$sheet->id)->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum')->getJson('/api/sheets/'.$sheet->id)->assertForbidden();
        $this->putJson('/api/sheets/'.$sheet->id, [])->assertForbidden();
        $this->patchJson('/api/sheets/'.$sheet->id, ['name' => 'Budget'])->assertForbidden();
        $this->deleteJson('/api/sheets/'.$sheet->id)->assertForbidden();
    }
}
