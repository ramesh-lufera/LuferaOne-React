<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use DatabaseMigrations;

    private function category(string $type = 'product'): int
    {
        return DB::table('categories')->insertGetId([
            'name' => ucfirst($type), 'page_slug' => $type, 'type' => $type,
            'inclusions' => '[]', 'exclusions' => '[]', 'requires_login' => false,
        ]);
    }

    private function payload(): array
    {
        return [
            'category_id' => $this->category(), 'name' => 'Starter',
            'title' => 'Starter product', 'subtitle' => 'Everything you need',
            'description' => 'A full description', 'short_description' => 'A short description',
            'product_image' => UploadedFile::fake()->image('product.png'),
            'breadcrumb_image' => UploadedFile::fake()->image('breadcrumb.png'),
            'price' => '200.00', 'preview_price' => '240.00', 'duration_value' => 30, 'duration_unit' => 'day',
            'tags' => 'software, CRM', 'inclusions' => ['Support'], 'exclusions' => ['Hardware'],
            'is_featured' => true, 'requires_login' => false,
        ];
    }

    public function test_product_endpoints_require_product_access(): void
    {
        $this->getJson('/api/products')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/products')->assertForbidden();
        $this->getJson('/api/products/categories')->assertForbidden();
        $this->getJson('/api/products/options/taxes')->assertForbidden();
        $this->postJson('/api/products', [])->assertForbidden();
        $this->putJson('/api/products/1', [])->assertForbidden();
        $this->deleteJson('/api/products/1')->assertForbidden();
        $this->getJson('/api/products/starter')->assertForbidden();
    }

    public function test_category_options_only_include_product_categories(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $id = $this->category();
        $this->category('package');
        $this->category('service');

        $this->getJson('/api/products/categories')->assertOk()
            ->assertExactJson(['categories' => [['id' => $id, 'name' => 'Product']]]);
    }

    public function test_product_creation_listing_pages_images_and_duplicate_slugs(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $id = $this->postJson('/api/products', $payload)->assertCreated()->assertJsonPath('page_path', '/products/starter')->json('id');
        $this->assertDatabaseHas('products', ['id' => $id, 'price' => 200, 'tags' => 'software, CRM', 'is_featured' => true]);
        $this->getJson('/api/products?search=CRM')->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.category_name', 'Product');
        $page = $this->getJson('/api/products/starter')->assertOk()->assertJsonPath('product.duration_value', 30)
            ->assertJsonPath('product.inclusions', ['Support'])->assertJsonMissingPath('product.product_image_path');
        $this->get($page->json('product.product_image_url'))->assertOk();
        $this->get('/api/products/starter/images/product_image')->assertForbidden();
        $this->getJson('/api/external/products/starter')->assertOk()->assertJsonPath('product.title', 'Starter product');
        $this->postJson('/api/products', $payload)->assertCreated()->assertJsonPath('page_path', '/products/starter-2');
        $this->postJson('/api/products', array_replace($payload, ['name' => 'New']))->assertCreated()->assertJsonPath('page_path', '/products/product-new');
        $this->getJson('/api/products/missing')->assertNotFound();
    }

    public function test_invalid_product_data_does_not_store_records_or_images(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $payload['category_id'] = $this->category('package');
        $payload['price'] = -1;
        $payload['preview_price'] = -2;
        $payload['duration_value'] = 0;
        $payload['duration_unit'] = 'invalid';
        $payload['tags'] = '';
        $payload['product_image'] = UploadedFile::fake()->create('bad.txt');

        $this->postJson('/api/products', $payload)->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'price', 'preview_price', 'duration_value', 'duration_unit', 'tags', 'product_image']);
        $this->assertDatabaseCount('products', 0);
        $this->assertCount(0, Storage::disk('local')->allFiles('products'));
    }

    public function test_product_update_preserves_page_and_images_and_delete_cleans_up_files(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $payload['gallery_images'] = [UploadedFile::fake()->image('gallery.png')];
        $id = $this->postJson('/api/products', $payload)->assertCreated()->json('id');
        $before = DB::table('products')->find($id);
        unset($payload['product_image'], $payload['breadcrumb_image'], $payload['gallery_images']);
        $payload['name'] = 'Renamed';
        $payload['price'] = '220.00';
        $payload['is_featured'] = false;
        $this->postJson('/api/products/'.$id, $payload + ['_method' => 'PUT'])->assertOk()->assertJsonPath('page_path', '/products/starter');
        $after = DB::table('products')->find($id);
        $this->assertSame($before->product_image_path, $after->product_image_path);
        $this->assertSame($before->gallery_image_paths, $after->gallery_image_paths);
        $this->getJson('/api/products/starter')->assertOk()->assertJsonPath('product.name', 'Renamed')->assertJsonCount(1, 'product.gallery_image_urls');
        $this->deleteJson('/api/categories/'.$payload['category_id'])->assertUnprocessable();
        $this->deleteJson('/api/products/'.$id)->assertOk();
        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('categories', 1);
        $this->assertCount(0, Storage::disk('local')->allFiles('products'));
        $this->getJson('/api/products/starter')->assertNotFound();
        $this->getJson('/api/external/products/starter')->assertNotFound();
    }

    public function test_product_tax_and_login_required_pricing_match_packages(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $taxId = $this->postJson('/api/taxes', ['name' => 'GST', 'region' => 'India', 'rate' => 18, 'type' => 'exclusive', 'is_default' => false])->assertCreated()->json('id');
        $payload = $this->payload();
        $payload['tax_id'] = $taxId;
        $payload['requires_login'] = true;
        $this->postJson('/api/products', $payload)->assertCreated();
        $this->getJson('/api/products/starter')->assertOk()->assertJsonPath('product.durations.0.total_amount', '236.00');
        $this->deleteJson('/api/taxes/'.$taxId)->assertUnprocessable();
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/external/products/starter')->assertOk()->assertJsonPath('product.pricing_locked', true)
            ->assertJsonPath('product.durations', [])->assertJsonPath('product.price', null)->assertJsonPath('product.preview_price', null);
    }
}
