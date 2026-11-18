<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Services\RoleAccess;
use App\Services\UserIdentifier;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'username', 'password', 'terms_accepted_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['modules'];

    protected static function booted(): void
    {
        static::updating(function (User $user): void {
            if ($user->isDirty('user_code')) {
                throw new \LogicException('The User ID cannot be changed.');
            }
        });
    }

    protected function performInsert(Builder $query): bool
    {
        for ($attempt = 0; $attempt < 100; $attempt++) {
            $this->user_code = app(UserIdentifier::class)->generate();
            try {
                return parent::performInsert($query);
            } catch (UniqueConstraintViolationException $exception) {
                if ($attempt === 99 || ! $this->newQueryWithoutScopes()->where('user_code', $this->user_code)->lockForUpdate()->first(['id'])) {
                    throw $exception;
                }
            }
        }

        throw new \RuntimeException('Unable to generate a unique User ID.');
    }

    /** @return list<string> */
    public function getModulesAttribute(): array
    {
        return app(RoleAccess::class)->modules($this);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
