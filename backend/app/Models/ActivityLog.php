<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $guarded = ['*'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'occurred_at' => 'immutable_datetime'];
    }

    protected static function booted(): void
    {
        static::updating(function () {
            throw new LogicException('Activity logs are immutable.');
        });
        static::deleting(function () {
            throw new LogicException('Activity logs are immutable.');
        });
    }

    /** Display legacy authentication events by page without changing audit history. */
    public static function pageModuleExpression(): string
    {
        return "CASE WHEN module = 'Authentication' THEN CASE
            WHEN action IN ('Sign In', 'Failed Sign In', 'Login') THEN 'Sign In'
            WHEN action IN ('Sign Up', 'Create') THEN 'Sign Up'
            WHEN action IN ('Sign Out', 'Logout') THEN 'Sign Out'
            ELSE module END ELSE module END";
    }

    public static function pageDescriptionExpression(): string
    {
        $description = "CASE WHEN module = 'Authentication' THEN REPLACE(description, 'Authentication', (".static::pageModuleExpression().')) ELSE description END';

        return 'CASE WHEN INSTR(('.$description."), ' (record ') > 0 THEN SUBSTR((".$description.'), 1, INSTR(('.$description."), ' (record ') - 1) ELSE (".$description.') END';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
