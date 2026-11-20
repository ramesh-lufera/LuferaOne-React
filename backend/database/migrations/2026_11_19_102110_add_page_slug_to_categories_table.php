<?php

use App\Services\CategoryPageSlug;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('page_slug', 200)->nullable()->unique();
        });

        $slugs = app(CategoryPageSlug::class);
        DB::table('categories')->select('id', 'url', 'name')->chunkById(100, function ($categories) use ($slugs): void {
            foreach ($categories as $category) {
                DB::table('categories')->where('id', $category->id)
                    ->update(['page_slug' => $slugs->available($category->url, $category->name)]);
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('page_slug', 200)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['page_slug']);
            $table->dropColumn('page_slug');
        });
    }
};
