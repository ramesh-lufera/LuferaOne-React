<?php

namespace App\Http\Middleware;

use App\Services\RoleAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    public function handle(Request $request, Closure $next, string $module): Response
    {
        abort_unless($request->user() && app(RoleAccess::class)->allows($request->user(), $module), 403, 'You do not have access to this module.');

        return $next($request);
    }
}
