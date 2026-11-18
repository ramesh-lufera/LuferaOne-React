<?php

namespace App\Providers;

use App\Models\User;
use App\Services\RoleAccess;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        DB::listen(function (QueryExecuted $query): void {
            $request = $this->app->bound('request') ? $this->app->make('request') : null;
            if (! $request instanceof Request || ! $request->attributes->get('activity_track_database', false)) {
                return;
            }
            if (! preg_match('/^\s*(?:insert(?:\s+(?:or\s+ignore|ignore))?\s+into|replace\s+into|update|delete\s+from)\s+[`"\[]?([a-zA-Z0-9_]+)/i', $query->sql, $matches)) {
                return;
            }
            if (in_array(strtolower($matches[1]), ['activity_logs', 'personal_access_tokens', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'migrations'], true)) {
                return;
            }
            $request->attributes->set('activity_database_write', true);
        });

        RateLimiter::for('profile-password', fn (Request $request) => Limit::perMinute(5)->by((string) $request->user()->id));

        Gate::define('view-activity-logs', fn (User $user): bool => app(RoleAccess::class)->allows($user, 'activity-log'));
    }
}
