<?php

namespace App\Providers;

use App\Models\User;
use App\Services\RoleAccess;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('profile-password', fn (Request $request) => Limit::perMinute(5)->by((string) $request->user()->id));

        Gate::define('view-activity-logs', fn (User $user): bool => app(RoleAccess::class)->allows($user, 'activity-log'));
    }
}
