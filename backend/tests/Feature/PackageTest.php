<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PackageTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(array $overrides = []): array
    {
        $category = DB::table('categories')->insertGetId([
            'name' => 'LuferaOne', 'page_slug' => 'luferaone', 'type' => 'package',
            'inclusions' => '[]', 'exclusions' => '[]', 'requires_login' => false,
        ]);

        return array_replace([
            'category_id' => $category, 'module' => 'CRM', 'name' => 'Starter',
            'title' => 'Starter package', 'subtitle' => 'Everything you need',
            'description' => 'A full description', 'short_description' => 'A short description',
            'package_image' => UploadedFile::fake()->image('package.png'),
            'breadcrumb_image' => UploadedFile::fake()->image('breadcrumb.png'),
            'durations' => [['value' => 1, 'unit' => 'month', 'price' => '200.00', 'preview_price' => '240.00']],
            'inclusions' => ['Support'], 'exclusions' => ['Hardware'], 'addons' => ['packages'],
            'gst' => 18, 'requires_login' => false,
        ], $overrides);
    }

    public function test_listing_and_creation_require_package_access(): void
    {
        $this->getJson('/api/packages')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/packages')->assertForbidden();
        $this->getJson('/api/packages/categories')->assertForbidden();
        $this->getJson('/api/packages/options/taxes')->assertForbidden();
        $this->postJson('/api/packages', [])->assertForbidden();
        $this->putJson('/api/packages/1', [])->assertForbidden();
        $this->deleteJson('/api/packages/1')->assertForbidden();
    }

    public function test_category_options_only_include_package_categories(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $packageCategoryId = DB::table('categories')->insertGetId([
            'name' => 'Packages', 'page_slug' => 'packages', 'type' => 'package',
            'inclusions' => '[]', 'exclusions' => '[]', 'requires_login' => false,
        ]);
        foreach (['product', 'service'] as $type) {
            DB::table('categories')->insert([
                'name' => ucfirst($type), 'page_slug' => $type, 'type' => $type,
                'inclusions' => '[]', 'exclusions' => '[]', 'requires_login' => false,
            ]);
        }

        $this->getJson('/api/packages/categories')->assertOk()
            ->assertExactJson(['categories' => [['id' => $packageCategoryId, 'name' => 'Packages']]]);
    }

    public function test_package_save_creates_pages_and_signed_images(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $this->getJson('/api/packages/categories')->assertOk()->assertJsonPath('categories.0.name', 'LuferaOne');
        $this->postJson('/api/packages', $payload)->assertCreated()->assertJsonPath('page_path', '/packages/starter');
        $this->getJson('/api/packages?search=CRM')->assertOk()->assertJsonPath('data.0.category_name', 'LuferaOne')->assertJsonPath('total', 1);
        $page = $this->getJson('/api/packages/starter')->assertOk()->assertJsonPath('package.durations.0.price', '200.00')->assertJsonMissingPath('package.package_image_path');
        Storage::disk('local')->assertExists(DB::table('packages')->value('package_image_path'));
        $this->get($page->json('package.package_image_url'))->assertOk();
        $this->get('/api/packages/starter/images/package_image')->assertForbidden();
        $this->getJson('/api/external/packages/starter')->assertOk()->assertJsonPath('package.description', 'A full description');
        $this->getJson('/api/packages/missing')->assertNotFound();
    }

    public function test_duplicate_names_have_distinct_pages_and_new_is_reserved(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $this->postJson('/api/packages', $payload)->assertCreated();
        $this->postJson('/api/packages', $payload)->assertCreated()->assertJsonPath('page_path', '/packages/starter-2');
        $this->postJson('/api/packages', array_replace($payload, ['name' => 'New']))->assertCreated()->assertJsonPath('page_path', '/packages/package-new');
        $this->postJson('/api/packages', array_replace($payload, ['name' => 'Categories']))->assertCreated()->assertJsonPath('page_path', '/packages/package-categories');
        $this->getJson('/api/packages/package-categories')->assertOk()->assertJsonPath('package.name', 'Categories');
        $this->getJson('/api/packages?per_page=10&page=1')->assertOk()->assertJsonPath('total', 4);
    }

    public function test_guest_pricing_is_hidden_but_content_remains_public(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum')->postJson('/api/packages', $this->payload(['requires_login' => true]))->assertCreated();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/external/packages/starter')->assertOk()->assertJsonPath('package.pricing_locked', true)
            ->assertJsonPath('package.durations', [])->assertJsonPath('package.title', 'Starter package');
        $this->actingAs(User::factory()->create(), 'sanctum')->getJson('/api/external/packages/starter')->assertOk()
            ->assertJsonPath('package.pricing_locked', false)->assertJsonPath('package.durations.0.price', '200.00');
    }

    public function test_invalid_payload_does_not_store_package_or_images(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->postJson('/api/packages', $this->payload([
            'category_id' => 99999, 'package_image' => UploadedFile::fake()->create('bad.txt'),
            'durations' => [['value' => 0, 'unit' => 'invalid', 'price' => -1]], 'addons' => ['invalid'],
        ]))->assertUnprocessable()->assertJsonValidationErrors(['category_id', 'package_image', 'durations.0.value', 'durations.0.unit', 'durations.0.price', 'addons.0']);
        $this->assertDatabaseCount('packages', 0);
        $this->assertCount(0, Storage::disk('local')->allFiles('packages'));
        $this->getJson('/api/packages?per_page=500')->assertUnprocessable();
    }

    public function test_package_permission_can_be_assigned_without_category_management(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum')->postJson('/api/roles', [
            'name' => 'package_manager', 'description' => '', 'active' => true, 'modules' => ['packages'],
        ])->assertCreated();
        $user = User::factory()->create(['role' => 'package_manager']);
        $this->actingAs($user, 'sanctum')->getJson('/api/packages/categories')->assertOk();
        $this->getJson('/api/packages/options/taxes')->assertOk();
        $this->getJson('/api/taxes')->assertForbidden();
        $this->getJson('/api/categories')->assertForbidden();
    }

    public function test_category_with_packages_cannot_be_deleted(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $this->postJson('/api/packages', $payload)->assertCreated();
        $this->deleteJson('/api/categories/'.$payload['category_id'])->assertUnprocessable();
        $this->assertDatabaseCount('packages', 1);
        $this->assertDatabaseCount('categories', 1);
    }

    public function test_gallery_uploads_are_stored_and_served_through_signed_urls(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload(['gallery_images' => [
            UploadedFile::fake()->image('one.png'), UploadedFile::fake()->image('two.png'),
            UploadedFile::fake()->image('three.png'),
        ]]);
        $this->postJson('/api/packages', $payload)->assertCreated();
        $paths = json_decode(DB::table('packages')->value('gallery_image_paths'), true);
        $this->assertCount(3, $paths);
        $page = $this->getJson('/api/external/packages/starter')->assertOk()
            ->assertJsonCount(3, 'package.gallery_image_urls')->assertJsonMissingPath('package.gallery_image_paths');
        foreach ($page->json('package.gallery_image_urls') as $index => $url) {
            Storage::disk('local')->assertExists($paths[$index]);
            $this->get($url)->assertOk();
        }
        $this->get('/api/packages/starter/images/gallery_0')->assertForbidden();
    }

    public function test_gallery_rejects_invalid_files_and_more_than_three_images(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $this->postJson('/api/packages', $payload + ['gallery_images' => [UploadedFile::fake()->create('bad.txt')]])
            ->assertUnprocessable()->assertJsonValidationErrors('gallery_images.0');
        $this->postJson('/api/packages', $payload + ['gallery_images' => array_map(
            fn (int $index): UploadedFile => UploadedFile::fake()->image($index.'.png'), range(0, 3),
        )])->assertUnprocessable()->assertJsonValidationErrors('gallery_images');
        $this->assertDatabaseCount('packages', 0);
        $this->assertCount(0, Storage::disk('local')->allFiles('packages'));
    }

    public function test_optional_gallery_accepts_a_later_slot_and_legacy_packages(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $this->postJson('/api/packages', $payload + ['gallery_images' => [2 => UploadedFile::fake()->image('three.png')]])->assertCreated();
        $this->getJson('/api/packages/starter')->assertOk()->assertJsonCount(1, 'package.gallery_image_urls');
        DB::table('packages')->update(['gallery_image_paths' => null]);
        $this->getJson('/api/packages/starter')->assertOk()->assertJsonPath('package.gallery_image_urls', []);
    }

    public function test_update_prefills_data_and_preserves_images_and_page_urls_without_uploads(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload(['gallery_images' => [UploadedFile::fake()->image('gallery.png')]]);
        $id = $this->postJson('/api/packages', $payload)->assertCreated()->json('id');
        $before = DB::table('packages')->find($id);
        unset($payload['package_image'], $payload['breadcrumb_image'], $payload['gallery_images']);
        $payload['name'] = 'Renamed Starter';
        $payload['module'] = 'Updated CRM';
        $payload['title'] = 'Updated title';
        $payload['gst'] = null;
        $payload['requires_login'] = true;
        $payload['durations'][] = ['value' => 1, 'unit' => 'year', 'price' => 2000, 'preview_price' => 2400];
        $this->postJson('/api/packages/'.$id, $payload + ['_method' => 'PUT'])->assertOk()
            ->assertJsonPath('page_path', '/packages/starter')->assertJsonPath('message', 'Package updated successfully.');
        $after = DB::table('packages')->find($id);
        $this->assertSame($before->package_image_path, $after->package_image_path);
        $this->assertSame($before->breadcrumb_image_path, $after->breadcrumb_image_path);
        $this->assertSame($before->gallery_image_paths, $after->gallery_image_paths);
        $this->assertNull($after->gst);
        $this->assertDatabaseCount('packages', 1);
        $this->getJson('/api/packages/starter')->assertOk()->assertJsonPath('package.name', 'Renamed Starter')
            ->assertJsonPath('package.module', 'Updated CRM')->assertJsonCount(2, 'package.durations');
        $this->getJson('/api/external/packages/starter')->assertOk()->assertJsonPath('package.title', 'Updated title');
        $this->putJson('/api/packages/999999', $payload)->assertNotFound();
    }

    public function test_update_replaces_and_removes_images_and_cleans_up_obsolete_files(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload(['gallery_images' => [
            UploadedFile::fake()->image('one.png'), UploadedFile::fake()->image('two.png'), UploadedFile::fake()->image('three.png'),
        ]]);
        $id = $this->postJson('/api/packages', $payload)->assertCreated()->json('id');
        $before = DB::table('packages')->find($id);
        $oldGallery = json_decode($before->gallery_image_paths, true);
        $oldUrl = $this->getJson('/api/packages/starter')->json('package.package_image_url');
        $payload['package_image'] = UploadedFile::fake()->image('new-cover.png');
        unset($payload['breadcrumb_image']);
        $payload['gallery_images'] = [0 => UploadedFile::fake()->image('replacement.png'), 1 => UploadedFile::fake()->image('new.png')];
        $payload['remove_gallery_images'] = [1];
        $this->postJson('/api/packages/'.$id, $payload + ['_method' => 'PUT'])->assertOk();
        $after = DB::table('packages')->find($id);
        $newGallery = json_decode($after->gallery_image_paths, true);
        $this->assertCount(3, $newGallery);
        Storage::disk('local')->assertMissing([$before->package_image_path, $oldGallery[0], $oldGallery[1]]);
        Storage::disk('local')->assertExists([$after->package_image_path, $after->breadcrumb_image_path, ...$newGallery]);
        $this->assertSame($oldGallery[2], $newGallery[2]);
        $newUrl = $this->getJson('/api/packages/starter')->json('package.package_image_url');
        $this->assertNotSame($oldUrl, $newUrl);
    }

    public function test_invalid_update_preserves_the_package_and_existing_files(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $id = $this->postJson('/api/packages', $payload)->assertCreated()->json('id');
        $before = DB::table('packages')->find($id);
        $payload['package_image'] = UploadedFile::fake()->create('bad.txt');
        $payload['remove_gallery_images'] = [4];
        $this->postJson('/api/packages/'.$id, $payload + ['_method' => 'PUT'])->assertUnprocessable()
            ->assertJsonValidationErrors(['package_image', 'remove_gallery_images.0']);
        $this->assertEquals($before, DB::table('packages')->find($id));
        Storage::disk('local')->assertExists([$before->package_image_path, $before->breadcrumb_image_path]);
        $this->assertCount(2, Storage::disk('local')->allFiles('packages'));
    }

    public function test_delete_removes_both_pages_and_all_images_but_preserves_the_category(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $id = $this->postJson('/api/packages', $this->payload(['gallery_images' => [UploadedFile::fake()->image('one.png')]]))->assertCreated()->json('id');
        $imageUrl = $this->getJson('/api/packages/starter')->json('package.gallery_image_urls.0');
        $this->deleteJson('/api/packages/'.$id)->assertOk()->assertJsonPath('message', 'Package deleted successfully.');
        $this->assertDatabaseCount('packages', 0);
        $this->assertDatabaseCount('categories', 1);
        $this->assertCount(0, Storage::disk('local')->allFiles('packages'));
        $this->getJson('/api/packages/starter')->assertNotFound();
        $this->getJson('/api/external/packages/starter')->assertNotFound();
        $this->get($imageUrl)->assertNotFound();
        $this->deleteJson('/api/packages/'.$id)->assertNotFound();
    }

    public function test_saved_tax_options_and_exclusive_pricing_are_available_to_packages(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $taxId = $this->postJson('/api/taxes', ['name' => 'GST 18%', 'region' => 'India', 'rate' => 18, 'type' => 'exclusive', 'is_default' => true])->assertCreated()->json('id');
        $this->getJson('/api/packages/options/taxes')->assertOk()->assertJsonPath('taxes.0.id', $taxId)
            ->assertJsonPath('taxes.0.rate', '18.00')->assertJsonMissingPath('taxes.0.region')->assertJsonMissingPath('taxes.0.is_default');
        $payload = $this->payload(['tax_id' => $taxId, 'durations' => [['value' => 1, 'unit' => 'month', 'price' => 1000]]]);
        $id = $this->postJson('/api/packages', $payload)->assertCreated()->json('id');
        $this->assertNull(DB::table('packages')->find($id)->gst);
        $this->getJson('/api/external/packages/starter')->assertOk()->assertJsonPath('package.tax.id', $taxId)
            ->assertJsonPath('package.tax.type', 'exclusive')->assertJsonPath('package.durations.0.tax_amount', '180.00')
            ->assertJsonPath('package.durations.0.base_amount', '1000.00')->assertJsonPath('package.durations.0.total_amount', '1180.00');
        $this->putJson('/api/taxes/'.$taxId, ['name' => 'Tax 20%', 'region' => 'India', 'rate' => 20, 'type' => 'exclusive', 'is_default' => true])->assertOk();
        $this->getJson('/api/packages/starter')->assertJsonPath('package.tax.rate', '20.00')->assertJsonPath('package.durations.0.total_amount', '1200.00');
        $this->deleteJson('/api/taxes/'.$taxId)->assertUnprocessable();
        unset($payload['package_image'], $payload['breadcrumb_image']);
        $payload['tax_id'] = null;
        $this->putJson('/api/packages/'.$id, $payload)->assertOk();
        $this->getJson('/api/packages/starter')->assertJsonPath('package.tax', null)->assertJsonPath('package.gst', null);
        $this->deleteJson('/api/taxes/'.$taxId)->assertOk();
    }

    public function test_inclusive_tax_is_extracted_from_the_entered_price_and_hidden_with_locked_pricing(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $taxId = $this->postJson('/api/taxes', ['name' => 'GST included', 'region' => 'India', 'rate' => 18, 'type' => 'inclusive', 'is_default' => false])->assertCreated()->json('id');
        $this->postJson('/api/packages', $this->payload(['tax_id' => $taxId, 'requires_login' => true,
            'durations' => [['value' => 1, 'unit' => 'month', 'price' => 1180]],
        ]))->assertCreated();
        $this->getJson('/api/packages/starter')->assertJsonPath('package.durations.0.base_amount', '1000.00')
            ->assertJsonPath('package.durations.0.tax_amount', '180.00')->assertJsonPath('package.durations.0.total_amount', '1180.00');
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/external/packages/starter')->assertOk()->assertJsonPath('package.pricing_locked', true)
            ->assertJsonPath('package.durations', []);
    }

    public function test_fractional_tax_rates_round_to_cents_and_invalid_tax_ids_are_rejected(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload(['tax_id' => 999999]);
        $this->postJson('/api/packages', $payload)->assertUnprocessable()->assertJsonValidationErrors('tax_id');
        $this->assertDatabaseCount('packages', 0);
        $taxId = $this->postJson('/api/taxes', ['name' => 'Fractional', 'region' => 'India', 'rate' => '12.50', 'type' => 'exclusive', 'is_default' => false])->assertCreated()->json('id');
        $payload['tax_id'] = $taxId;
        $payload['durations'] = [['value' => 1, 'unit' => 'month', 'price' => '19.99']];
        $this->postJson('/api/packages', $payload)->assertCreated();
        $this->getJson('/api/packages/starter')->assertJsonPath('package.tax.rate', '12.50')
            ->assertJsonPath('package.durations.0.tax_amount', '2.50')->assertJsonPath('package.durations.0.total_amount', '22.49');
    }

    public function test_third_gallery_image_can_exceed_two_megabytes_within_the_five_megabyte_limit(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->postJson('/api/packages', $this->payload(['gallery_images' => [2 => UploadedFile::fake()->image('third.png')->size(3072)]]))
            ->assertCreated();
        $this->getJson('/api/packages/starter')->assertOk()->assertJsonCount(1, 'package.gallery_image_urls');
    }

    public function test_gallery_upload_errors_identify_the_image_and_show_the_size_limit(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $payload = $this->payload();
        $oversized = $this->postJson('/api/packages', $payload + ['gallery_images' => [2 => UploadedFile::fake()->image('third.png')->size(5121)]])
            ->assertUnprocessable()->assertJsonValidationErrors('gallery_images.2');
        $this->assertSame('Gallery Image 3 must be no larger than 5 MB.', $oversized->json('errors')['gallery_images.2'][0]);
        $file = new UploadedFile('', 'third.png', 'image/png', UPLOAD_ERR_INI_SIZE, true);
        $failed = $this->postJson('/api/packages', $payload + ['gallery_images' => [2 => $file]])->assertUnprocessable()->assertJsonValidationErrors('gallery_images.2');
        $this->assertSame('Gallery Image 3 failed to upload. Use a JPEG, PNG or WebP image no larger than 5 MB and try again.', $failed->json('errors')['gallery_images.2'][0]);
        $this->assertDatabaseCount('packages', 0);
    }
}
