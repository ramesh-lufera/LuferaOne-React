<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Str;

class ActivityLogger
{
    public function record(?User $actor, string $action, string $module, ?string $entityId = null, array $metadata = [], ?string $eventId = null, ?string $identifier = null): ActivityLog
    {
        $eventId ??= (string) Str::uuid();
        $existing = ActivityLog::where('event_id', $eventId)->first();
        if ($existing) {
            return $existing;
        }
        $log = new ActivityLog;
        $log->forceFill([
            'event_id' => $eventId, 'user_id' => $actor?->id,
            'username' => $actor?->username ?? $identifier,
            'user_name' => $actor?->name ?? $identifier ?? 'System',
            'action' => $action, 'module' => $module, 'entity_id' => $entityId,
            'description' => $action.' in '.$module.($entityId !== null ? ' (record '.$entityId.')' : ''),
            'metadata' => $metadata, 'occurred_at' => now('UTC'),
        ])->save();

        return $log;
    }
}
