<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TermsConditionTest extends TestCase
{
    use DatabaseMigrations;

    public function test_public_read_and_authorized_create_reload_update_keep_one_record(): void
    {
        $this->getJson('/api/terms-conditions')->assertOk()->assertJsonPath('policy.content', '');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $html = '<h2>Your terms</h2><p><strong>Bold</strong> <em>Italic</em> <u>Underline</u></p><ul><li>Bullet</li></ul><ol><li>Number</li></ol><p><a href="https://example.com">Contact</a></p>';
        $this->postJson('/api/settings/terms-conditions', ['content' => $html])->assertOk();
        $saved = $this->getJson('/api/settings/terms-conditions')->assertOk()->json('policy.content');
        $this->assertStringContainsString('<h2>Your terms</h2>', $saved);
        $this->assertStringContainsString('<u>Underline</u>', $saved);
        $this->assertStringContainsString('<ul><li>Bullet</li></ul>', $saved);
        $this->assertStringContainsString('<ol><li>Number</li></ol>', $saved);
        $this->assertStringContainsString('href="https://example.com"', $saved);
        $this->getJson('/api/terms-conditions')->assertJsonPath('policy.content', $saved);
        $this->putJson('/api/settings/terms-conditions', ['content' => '<p>Updated</p>'])->assertOk();
        $this->getJson('/api/terms-conditions')->assertJsonPath('policy.content', '<p>Updated</p>');
        $this->assertDatabaseCount('terms_conditions', 1);
    }

    public function test_management_requires_authentication_and_module_permission(): void
    {
        $this->getJson('/api/settings/terms-conditions')->assertUnauthorized();
        $this->putJson('/api/settings/terms-conditions', ['content' => '<p>Test</p>'])->assertUnauthorized();
        $this->postJson('/api/settings/terms-conditions', ['content' => '<p>Test</p>'])->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/terms-conditions')->assertOk();
        $this->getJson('/api/settings/terms-conditions')->assertForbidden();
        $this->putJson('/api/settings/terms-conditions', ['content' => '<p>Test</p>'])->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['terms-conditions'])]);
        $this->putJson('/api/settings/terms-conditions', ['content' => '<p>Allowed</p>'])->assertOk();
    }

    public function test_sanitization_removes_executable_markup_and_preserves_quill_formatting(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $html = '<script>alert(1)</script><svg onload="alert(1)"></svg><iframe src="https://evil.test"></iframe><p onclick="alert(1)" style="color:red" class="ql-align-center evil">Safe &amp; sound</p><a href="javascript:alert(1)">bad link</a><img src=x onerror="alert(1)"><ol><li data-list="bullet">Bullet</li></ol>';
        $content = $this->putJson('/api/settings/terms-conditions', ['content' => $html])->assertOk()->json('policy.content');
        foreach (['script', 'svg', 'iframe', 'onclick', 'style=', 'javascript:', '<img', 'evil'] as $unsafe) {
            $this->assertStringNotContainsString($unsafe, $content);
        }
        $this->assertStringContainsString('class="ql-align-center"', $content);
        $this->assertStringContainsString('data-list="bullet"', $content);
        $this->assertStringContainsString('Safe &amp; sound', $content);
        $this->getJson('/api/terms-conditions')->assertJsonPath('policy.content', $content);
    }

    public function test_invalid_and_empty_rich_text_cannot_overwrite_saved_content(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->putJson('/api/settings/terms-conditions', ['content' => '<p>Keep</p>'])->assertOk();
        foreach (['', '<p><br></p>', '<p>&nbsp;</p>', '<script>alert(1)</script>', str_repeat('x', 200001)] as $content) {
            $this->putJson('/api/settings/terms-conditions', ['content' => $content])->assertUnprocessable()->assertJsonValidationErrors('content');
        }
        $this->getJson('/api/terms-conditions')->assertJsonPath('policy.content', '<p>Keep</p>');
    }
}
