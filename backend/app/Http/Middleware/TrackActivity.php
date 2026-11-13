<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\ActivityLogger;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    public function __construct(private ActivityLogger $logger) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/health', 'api/user', 'api/activity-logs', 'api/activity-logs/*') || $request->isMethod('OPTIONS') || $request->isMethod('HEAD')) {
            return $next($request);
        }
        $module = Str::headline($request->segment(2) ?? 'Application');
        $action = match ($request->method()) {
            'POST' => 'Create', 'PUT', 'PATCH' => 'Update', 'DELETE' => 'Delete', default => 'View'
        };
        if ($request->is('api/login', 'api/logout', 'api/register')) {
            $action = match ($request->segment(2)) {
                'login' => 'Sign In', 'logout' => 'Sign Out', default => 'Sign Up'
            };
            $module = $action;
        }
        $eventId = (string) Str::uuid();
        $transactionLevel = DB::transactionLevel();
        DB::beginTransaction();
        try {
            $response = $next($request);
            if ($response->isSuccessful()) {
                $actor = $request->user() ?? $request->attributes->get('activity_actor');
                if ($actor instanceof User) {
                    $parameters = $request->route()?->parameters();
                    $entityId = $request->attributes->get('activity_entity_id');
                    if ($entityId === null && $parameters) {
                        $entity = end($parameters);
                        $entityId = $entity instanceof Model ? $entity->getKey() : $entity;
                    }
                    $this->logger->record($actor, $action, $request->attributes->get('activity_page', $module), $entityId !== null ? (string) $entityId : null,
                        ['method' => $request->method(), 'route' => $request->route()?->uri()], $eventId);
                }
                DB::commit();
            } else {
                DB::rollBack();
                if ($request->is('api/login') && $response->getStatusCode() === 401 && $request->attributes->has('activity_failed_email')) {
                    $this->logger->record(null, 'Failed Sign In', 'Sign In', metadata: ['reason' => 'Invalid credentials'], eventId: $eventId, identifier: $request->attributes->get('activity_failed_email'));
                }
            }

            return $response;
        } catch (\Throwable $exception) {
            if (DB::transactionLevel() > $transactionLevel) {
                DB::rollBack($transactionLevel);
            }
            throw $exception;
        }
    }
}
