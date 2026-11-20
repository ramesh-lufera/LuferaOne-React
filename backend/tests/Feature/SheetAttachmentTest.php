<?php

namespace Tests\Feature;

use App\Models\Sheet;
use App\Models\SheetAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SheetAttachmentTest extends TestCase
{
    use DatabaseMigrations;

    private function sheetWithRows(): Sheet
    {
        $rows = [array_fill(0, 4, ['value' => 'Task A']), array_fill(0, 4, ['value' => 'Task B'])];
        $rows[0][0]['rowId'] = 'task-a';
        $rows[1][0]['rowId'] = 'task-b';

        return Sheet::factory()->create(['content' => ['rows' => $rows]]);
    }

    public function test_uploads_persist_and_download_from_the_correct_row_with_private_storage(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user, 'sanctum');
        $sheet = $this->sheetWithRows();
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-b/attachments';
        $response = $this->postJson($endpoint, ['file' => UploadedFile::fake()->create('report.pdf', 10, 'application/pdf'), 'user_id' => 999])->assertCreated()->assertJsonPath('attachment.name', 'report.pdf')->assertJsonPath('attachment.user_id', $user->id)->assertJsonPath('attachment.user.name', $user->name)->assertJsonMissingPath('attachment.path');
        $attachment = SheetAttachment::findOrFail($response->json('attachment.id'));
        Storage::disk('local')->assertExists($attachment->path);
        $this->getJson('/api/sheets/'.$sheet->id)->assertOk()->assertJsonPath('row_activity.attachments.task-b', 1);
        $this->getJson($endpoint)->assertOk()->assertJsonCount(1, 'attachments')->assertJsonPath('attachments.0.name', 'report.pdf')->assertJsonPath('attachments.0.user.name', $user->name);
        $this->getJson('/api/sheets/'.$sheet->id.'/rows/task-a/attachments')->assertOk()->assertJsonCount(0, 'attachments');
        $this->get($endpoint.'/'.$attachment->id.'/file')->assertOk()->assertDownload('report.pdf')->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->get('/api/sheets/'.$sheet->id.'/rows/task-a/attachments/'.$attachment->id.'/file')->assertNotFound();
        $other = $this->sheetWithRows();
        $this->get('/api/sheets/'.$other->id.'/rows/task-b/attachments/'.$attachment->id.'/file')->assertNotFound();
        $rows = [$sheet->content['rows'][1]];
        $this->putJson('/api/sheets/'.$sheet->id, ['version' => 0, 'content' => ['rows' => $rows]])->assertOk();
        $this->getJson($endpoint)->assertJsonCount(1, 'attachments');
        $this->deleteJson('/api/sheets/'.$sheet->id)->assertOk();
        $this->assertDatabaseCount('sheet_attachments', 0);
        Storage::disk('local')->assertMissing($attachment->path);
    }

    public function test_raster_images_have_previews_and_active_content_downloads_as_a_file(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = $this->sheetWithRows();
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-a/attachments';
        $image = UploadedFile::fake()->createWithContent('photo.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII='));
        $id = $this->postJson($endpoint, ['file' => $image])->assertCreated()->json('attachment.id');
        $this->get($endpoint.'/'.$id.'/file?preview=1')->assertOk()->assertHeader('Content-Type', 'image/png');
        $html = UploadedFile::fake()->createWithContent('page.html', '<html><script>alert(1)</script></html>');
        $id = $this->postJson($endpoint, ['file' => $html])->assertCreated()->json('attachment.id');
        $this->get($endpoint.'/'.$id.'/file?preview=1')->assertOk()->assertDownload('page.html')->assertHeader('Content-Type', 'application/octet-stream');
    }

    public function test_invalid_uploads_and_missing_rows_are_rejected_without_storing_files(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $sheet = $this->sheetWithRows();
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-a/attachments';
        $this->postJson($endpoint, [])->assertUnprocessable()->assertJsonValidationErrors('file');
        $this->postJson($endpoint, ['file' => UploadedFile::fake()->create('large.pdf', 20481)])->assertUnprocessable();
        $this->postJson('/api/sheets/'.$sheet->id.'/rows/missing/attachments', ['file' => UploadedFile::fake()->create('report.pdf')])->assertNotFound();
        $this->assertDatabaseCount('sheet_attachments', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_attachment_endpoints_require_authentication_and_module_permission(): void
    {
        $sheet = $this->sheetWithRows();
        $attachment = SheetAttachment::factory()->create(['sheet_id' => $sheet->id, 'row_id' => 'task-a']);
        $endpoint = '/api/sheets/'.$sheet->id.'/rows/task-a/attachments';
        $this->getJson($endpoint)->assertUnauthorized();
        $this->postJson($endpoint, [])->assertUnauthorized();
        $this->getJson($endpoint.'/'.$attachment->id.'/file')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson($endpoint)->assertForbidden();
        $this->postJson($endpoint, [])->assertForbidden();
        $this->getJson($endpoint.'/'.$attachment->id.'/file')->assertForbidden();
    }
}
