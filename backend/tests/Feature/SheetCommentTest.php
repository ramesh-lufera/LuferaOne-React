<?php

namespace Tests\Feature;

use App\Models\Sheet;
use App\Models\SheetComment;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class SheetCommentTest extends TestCase
{
    use DatabaseMigrations;

    private function sheetWithRows(): Sheet
    {
        $rows = [array_fill(0, 4, ['value' => 'Task A']), array_fill(0, 4, ['value' => 'Task B'])];
        $rows[0][0]['rowId'] = 'task-a';
        $rows[1][0]['rowId'] = 'task-b';

        return Sheet::factory()->create(['content' => ['rows' => $rows]]);
    }

    public function test_comments_and_replies_persist_for_the_correct_row_and_author(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user, 'sanctum');
        $sheet = $this->sheetWithRows();
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-b/comments';
        $message = $this->postJson($endpoint, ['body' => '  Please review  ', 'user_id' => 999])->assertCreated()->assertJsonPath('comment.body', 'Please review')->assertJsonPath('comment.user.id', $user->id)->json('comment.id');
        $reply = $this->postJson($endpoint, ['body' => 'Reviewed', 'parent_id' => $message])->assertCreated()->assertJsonPath('comment.parent_id', $message)->json('comment.id');
        $this->postJson($endpoint, ['body' => 'Thank you', 'parent_id' => $reply])->assertCreated();
        $this->getJson($endpoint)->assertOk()->assertJsonCount(3, 'comments')->assertJsonPath('comments.1.body', 'Reviewed');
        $this->getJson('/api/sheets/'.$sheet->id)->assertOk()->assertJsonPath('row_activity.comments.task-b', 3);
        $this->getJson('/api/sheets/'.$sheet->id.'/rows/task-a/comments')->assertOk()->assertJsonCount(0, 'comments');
        $rows = [$sheet->content['rows'][1]];
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => $rows]])->assertOk();
        $this->getJson($endpoint)->assertOk()->assertJsonCount(3, 'comments');
        $this->getJson('/api/sheets/'.$sheet->id.'/rows/task-a/comments')->assertNotFound();
        $this->deleteJson('/api/sheets/'.$sheet->id)->assertOk();
        $this->assertDatabaseCount('sheet_comments', 0);
    }

    public function test_invalid_comments_and_replies_to_another_row_or_sheet_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = $this->sheetWithRows();
        $other = $this->sheetWithRows();
        $foreign = SheetComment::factory()->create(['sheet_id' => $other->id, 'row_id' => 'task-a']);
        $anotherRow = SheetComment::factory()->create(['sheet_id' => $sheet->id, 'row_id' => 'task-b']);
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-a/comments';
        foreach (['', '   ', str_repeat('x', 5001), ['invalid']] as $body) {
            $this->postJson($endpoint, ['body' => $body])->assertUnprocessable();
        }
        foreach ([$foreign->id, $anotherRow->id, 99999] as $parent) {
            $this->postJson($endpoint, ['body' => 'Reply', 'parent_id' => $parent])->assertUnprocessable();
        }
        $this->postJson('/api/sheets/'.$sheet->id.'/rows/missing/comments', ['body' => 'Missing'])->assertNotFound();
        $this->assertDatabaseCount('sheet_comments', 2);
    }

    public function test_comment_endpoints_require_authentication_and_module_access(): void
    {
        $sheet = $this->sheetWithRows();
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-a/comments';
        $this->getJson($endpoint)->assertUnauthorized();
        $this->postJson($endpoint, ['body' => 'Test'])->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson($endpoint)->assertForbidden();
        $this->postJson($endpoint, ['body' => 'Test'])->assertForbidden();
        $this->assertDatabaseCount('sheet_comments', 0);
    }

    public function test_legacy_rows_have_stable_comment_identifiers(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = Sheet::factory()->create(['content' => ['rows' => [array_fill(0, 5, ['value' => 'Legacy'])]]]);
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/legacy-'.$sheet->id.'-0/comments';
        $this->postJson($endpoint, ['body' => 'Legacy comment'])->assertCreated();
        $rows = $sheet->content['rows'];
        $rows[0][0]['rowId'] = 'legacy-'.$sheet->id.'-0';
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => $rows]])->assertOk();
        $this->getJson($endpoint)->assertOk()->assertJsonPath('comments.0.body', 'Legacy comment');
    }
}
