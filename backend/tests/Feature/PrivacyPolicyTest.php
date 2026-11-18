<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PrivacyPolicyTest extends TestCase
{
    use DatabaseMigrations;

    public function test_public_read_and_authorized_create_reload_update_keep_one_record(): void
    {
        $this->getJson('/api/privacy-policy')->assertOk()->assertJsonPath('policy.content', '');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $html = '<h2>Your privacy</h2><p><strong>Bold</strong> <em>Italic</em> <u>Underline</u></p><ul><li>Bullet</li></ul><ol><li>Number</li></ol><p><a href="https://example.com">Contact</a></p>';
        $this->postJson('/api/settings/privacy-policy', ['content' => $html])->assertOk();
        $saved = $this->getJson('/api/settings/privacy-policy')->assertOk()->json('policy.content');
        $this->assertStringContainsString('<h2>Your privacy</h2>', $saved);
        $this->assertStringContainsString('<u>Underline</u>', $saved);
        $this->assertStringContainsString('<ul><li>Bullet</li></ul>', $saved);
        $this->assertStringContainsString('<ol><li>Number</li></ol>', $saved);
        $this->assertStringContainsString('href="https://example.com"', $saved);
        $this->getJson('/api/privacy-policy')->assertJsonPath('policy.content', $saved);
        $this->putJson('/api/settings/privacy-policy', ['content' => '<p>Updated</p>'])->assertOk();
        $this->getJson('/api/privacy-policy')->assertJsonPath('policy.content', '<p>Updated</p>');
        $this->assertDatabaseCount('privacy_policies', 1);
    }

    public function test_management_requires_authentication_and_module_permission(): void
    {
        $this->getJson('/api/settings/privacy-policy')->assertUnauthorized();
        $this->putJson('/api/settings/privacy-policy', ['content' => '<p>Test</p>'])->assertUnauthorized();
        $this->postJson('/api/settings/privacy-policy', ['content' => '<p>Test</p>'])->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/privacy-policy')->assertOk();
        $this->getJson('/api/settings/privacy-policy')->assertForbidden();
        $this->putJson('/api/settings/privacy-policy', ['content' => '<p>Test</p>'])->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['privacy-policy'])]);
        $this->putJson('/api/settings/privacy-policy', ['content' => '<p>Allowed</p>'])->assertOk();
    }

    public function test_sanitization_removes_executable_markup_and_preserves_quill_formatting(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $html = '<script>alert(1)</script><svg onload="alert(1)"></svg><iframe src="https://evil.test"></iframe><p onclick="alert(1)" style="color:red" class="ql-align-center evil">Safe &amp; sound</p><a href="javascript:alert(1)">bad link</a><img src=x onerror="alert(1)"><ol><li data-list="bullet">Bullet</li></ol>';
        $content = $this->putJson('/api/settings/privacy-policy', ['content' => $html])->assertOk()->json('policy.content');
        foreach (['script', 'svg', 'iframe', 'onclick', 'style=', 'javascript:', '<img', 'evil'] as $unsafe) {
            $this->assertStringNotContainsString($unsafe, $content);
        }
        $this->assertStringContainsString('class="ql-align-center"', $content);
        $this->assertStringContainsString('data-list="bullet"', $content);
        $this->assertStringContainsString('Safe &amp; sound', $content);
        $this->getJson('/api/privacy-policy')->assertJsonPath('policy.content', $content);
    }

    public function test_invalid_and_empty_rich_text_cannot_overwrite_saved_content(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->putJson('/api/settings/privacy-policy', ['content' => '<p>Keep</p>'])->assertOk();
        foreach (['', '<p><br></p>', '<p>&nbsp;</p>', '<script>alert(1)</script>', str_repeat('x', 200001)] as $content) {
            $this->putJson('/api/settings/privacy-policy', ['content' => $content])->assertUnprocessable()->assertJsonValidationErrors('content');
        }
        $this->getJson('/api/privacy-policy')->assertJsonPath('policy.content', '<p>Keep</p>');
    }
}
