<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use DatabaseMigrations;

    private function category(string $name): int
    {
        return DB::table('categories')->insertGetId(['name' => $name, 'type' => 'product', 'page_slug' => strtolower($name), 'inclusions' => '[]', 'exclusions' => '[]', 'created_at' => now(), 'updated_at' => now()]);
    }

    private function slides(bool $images = true): array
    {
        return array_map(fn (int $i): array => [
            'title' => 'Slide '.$i, 'description' => 'Description', 'button_text' => 'Explore Marketplace', 'button_link' => '#marketplace-products',
            ...($images ? ['image' => UploadedFile::fake()->image('slide.png')] : []),
        ], [1, 2, 3]);
    }

    public function test_settings_require_authentication_and_permission(): void
    {
        $this->getJson('/api/settings/marketplace')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/settings/marketplace')->assertForbidden();
        $this->postJson('/api/settings/marketplace/sliders', [])->assertForbidden();
        $this->postJson('/api/settings/marketplace/banners', [])->assertForbidden();
        $this->putJson('/api/settings/marketplace/sliders/order', [])->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['marketplace'])]);
        $this->getJson('/api/settings/marketplace')->assertOk();
    }

    public function test_categories_can_be_added_edited_reordered_and_removed(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $firstCategory = $this->category('Software');
        $secondCategory = $this->category('Stationery');
        $first = $this->postJson('/api/settings/marketplace/sliders', ['category_id' => $firstCategory, 'slider' => 2])->assertCreated()->json('id');
        $second = $this->postJson('/api/settings/marketplace/sliders', ['category_id' => $secondCategory])->assertCreated()->json('id');
        $this->postJson('/api/settings/marketplace/sliders', ['category_id' => $firstCategory])->assertUnprocessable();
        $this->putJson('/api/settings/marketplace/sliders/'.$first, ['category_id' => $firstCategory, 'slider' => 3])->assertOk();
        $this->putJson('/api/settings/marketplace/sliders/order', ['ids' => [$second, $first]])->assertOk();
        $this->getJson('/api/settings/marketplace')->assertJsonPath('sliders.0.id', $second)->assertJsonPath('sliders.1.slider', 3);
        $this->putJson('/api/settings/marketplace/sliders/order', ['ids' => [$first]])->assertUnprocessable();
        $this->putJson('/api/settings/marketplace/sliders/order', ['ids' => [$first, $first]])->assertUnprocessable();
        $this->getJson('/api/external/marketplace')->assertOk()->assertJsonPath('sliders.0.page_path', '/external/categories/stationery');
        $this->deleteJson('/api/settings/marketplace/sliders/'.$first)->assertOk();
        $this->assertDatabaseHas('categories', ['id' => $firstCategory]);
        $this->deleteJson('/api/settings/marketplace/sliders/'.$first)->assertNotFound();
    }

    public function test_three_banner_slides_save_keep_images_on_edit_and_clean_up_on_delete(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $id = $this->post('/api/settings/marketplace/banners', ['slides' => $this->slides()], ['Accept' => 'application/json'])->assertCreated()->json('id');
        $paths = Storage::disk('local')->allFiles('marketplace');
        $this->assertCount(3, $paths);
        $result = $this->getJson('/api/settings/marketplace')->assertOk()->assertJsonPath('banners.0.slides.0.title', 'Slide 1')->assertJsonMissingPath('banners.0.slides.0.image_path');
        $url = $result->json('banners.0.slides.0.image_url');
        $this->get($url)->assertOk();
        $this->putJson('/api/settings/marketplace/banners/'.$id, ['slides' => $this->slides(false)])->assertOk();
        $this->assertSame($paths, Storage::disk('local')->allFiles('marketplace'));
        $this->getJson('/api/external/marketplace')->assertJsonCount(3, 'banners.0.slides');
        $this->deleteJson('/api/settings/marketplace/banners/'.$id)->assertOk();
        $this->assertCount(0, Storage::disk('local')->allFiles('marketplace'));
        $this->get($url)->assertNotFound();
    }

    public function test_invalid_banner_data_is_rejected_without_uploads(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->postJson('/api/settings/marketplace/banners', ['slides' => $this->slides(false)])->assertUnprocessable()->assertJsonValidationErrors('slides.0.image');
        $slides = $this->slides();
        $slides[0]['button_link'] = 'javascript:alert(1)';
        $this->post('/api/settings/marketplace/banners', ['slides' => $slides], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('slides.0.button_link');
        $this->assertDatabaseCount('marketplace_banners', 0);
        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_catalog_cards_include_signed_images_and_respect_login_restrictions(): void
    {
        Storage::fake('local');
        $category = $this->category('Software');
        DB::table('marketplace_sliders')->insert(['category_id' => $category, 'slider' => 3, 'position' => 1]);
        Storage::disk('local')->put('products/cover.png', 'image');
        DB::table('products')->insert([
            'category_id' => $category, 'name' => 'CRM', 'page_slug' => 'crm', 'title' => 'CRM', 'subtitle' => 'For teams',
            'description' => 'Full description', 'short_description' => 'Manage customers',
            'product_image_path' => 'products/cover.png', 'breadcrumb_image_path' => 'products/cover.png',
            'price' => 200, 'preview_price' => 240, 'duration_value' => 1, 'duration_unit' => 'month',
            'tags' => 'CRM', 'inclusions' => '["Support"]', 'exclusions' => '[]', 'requires_login' => true,
        ]);
        $guest = $this->getJson('/api/external/marketplace')->assertOk()
            ->assertJsonPath('sliders.0.items.0.page_path', '/external/products/crm')
            ->assertJsonPath('sliders.0.items.0.pricing_locked', true)
            ->assertJsonPath('sliders.0.items.0.price', null)
            ->assertJsonMissingPath('sliders.0.items.0.product_image_path');
        $this->get($guest->json('sliders.0.items.0.image_url'))->assertOk();
        DB::table('categories')->where('id', $category)->update(['requires_login' => true]);
        $this->getJson('/api/external/marketplace')->assertJsonCount(0, 'sliders.0.items');
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/external/marketplace')->assertOk()
            ->assertJsonPath('sliders.0.items.0.pricing_locked', false)
            ->assertJsonPath('sliders.0.items.0.price', '200.00');
    }
}
