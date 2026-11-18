<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeProfilePasswordRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\RoleAccess;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UserController extends Controller
{
    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($request): User {
                $user = new User($request->safe()->only(['name', 'email', 'phone', 'username', 'password']));
                $user->role = 'user';
                $user->save();
                $details = $request->safe()->only(['business_name', 'gstin', 'date_of_birth', 'address', 'city', 'state', 'country', 'pincode']);
                if ($request->hasFile('profile_image')) {
                    $path = $request->file('profile_image')->store('users', 'local');
                    if (! $path) {
                        throw new \RuntimeException('Profile image could not be stored.');
                    }
                    DB::afterRollBack(fn () => Storage::disk('local')->delete($path));
                    $details['profile_image_path'] = $path;
                }
                DB::table('user_details')->insert([...$details, 'user_id' => $user->id, 'created_at' => now(), 'updated_at' => now()]);

                return $user;
            });
        } catch (UniqueConstraintViolationException $exception) {
            $errors = [];
            foreach (['email', 'username'] as $field) {
                if (User::where($field, $request->validated($field))->exists()) {
                    $errors[$field] = ['This '.$field.' is already in use.'];
                }
            }
            if ($errors === []) {
                throw $exception;
            }
            throw ValidationException::withMessages($errors);
        }
        request()->attributes->set('activity_entity_id', $user->id);

        return response()->json(['message' => 'User created successfully.', 'user' => $user->only(['id', 'user_code', 'name', 'email', 'username', 'phone', 'role'])], 201);
    }

    public function show(int $user): JsonResponse
    {
        return response()->json(['user' => $this->data(User::findOrFail($user))]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->data($request->user()->fresh())]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        request()->attributes->set('activity_entity_id', $request->user()->id);

        return $this->saveUser($request, $request->user()->id, true);
    }

    public function changePassword(ChangeProfilePasswordRequest $request): JsonResponse
    {
        DB::transaction(function () use ($request): void {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            if (! Hash::check($request->validated('current_password'), $user->password)) {
                throw ValidationException::withMessages(['current_password' => ['The current password is incorrect.']]);
            }
            if (Hash::check($request->validated('password'), $user->password)) {
                throw ValidationException::withMessages(['password' => ['The new password must be different from your current password.']]);
            }
            $user->password = $request->validated('password');
            $user->save();
            $currentToken = $request->user()->currentAccessToken();
            $currentTokenId = $currentToken instanceof PersonalAccessToken ? $currentToken->getKey() : null;
            $user->tokens()->when($currentTokenId, fn ($query) => $query->where('id', '!=', $currentTokenId))->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
        });
        request()->attributes->set('activity_entity_id', $request->user()->id);

        return response()->json(['message' => 'Password changed successfully. Other sessions have been signed out.']);
    }

    public function update(UpdateUserRequest $request, int $user): JsonResponse
    {
        return $this->saveUser($request, $user);
    }

    private function saveUser(UpdateUserRequest $request, int $user, bool $self = false): JsonResponse
    {
        try {
            $target = DB::transaction(function () use ($request, $user, $self): User {
                if (! $self) {
                    DB::table('roles')->orderBy('id')->lockForUpdate()->get();
                }
                $target = User::whereKey($user)->lockForUpdate()->firstOrFail();
                if (! $self) {
                    $this->authorizeManagement($request, $target);
                }
                $previousEmail = $target->email;
                $target->fill($request->safe()->only(['name', 'email', 'phone', 'username']));
                if ($target->email !== $previousEmail) {
                    $target->email_verified_at = null;
                }
                if ($request->filled('password')) {
                    $target->password = $request->validated('password');
                    $target->tokens()->delete();
                    DB::table('sessions')->where('user_id', $target->id)->delete();
                }
                $target->save();
                $existing = DB::table('user_details')->where('user_id', $target->id)->first();
                $details = $request->safe()->only(['business_name', 'gstin', 'date_of_birth', 'address', 'city', 'state', 'country', 'pincode']);
                foreach ($self ? ['profile_image', 'cover_image'] : ['profile_image'] as $image) {
                    $column = $image.'_path';
                    $previousImage = $existing?->$column;
                    if ($request->hasFile($image)) {
                        $path = $request->file($image)->store('users', 'local');
                        if (! $path) {
                            throw new \RuntimeException('Image could not be stored.');
                        }
                        DB::afterRollBack(fn () => Storage::disk('local')->delete($path));
                        $details[$column] = $path;
                    } elseif ($request->boolean('remove_'.$image)) {
                        $details[$column] = null;
                    }
                    if (array_key_exists($column, $details) && $previousImage && $previousImage !== $details[$column]) {
                        DB::afterCommit(fn () => Storage::disk('local')->delete($previousImage));
                    }
                }
                DB::table('user_details')->updateOrInsert(['user_id' => $target->id], [...$details, 'created_at' => $existing?->created_at ?? now(), 'updated_at' => now()]);

                return $target;
            });
        } catch (UniqueConstraintViolationException $exception) {
            $errors = [];
            foreach (['email', 'username'] as $field) {
                if ($request->filled($field) && User::where($field, $request->validated($field))->where('id', '!=', $user)->exists()) {
                    $errors[$field] = ['This '.$field.' is already in use.'];
                }
            }
            if ($errors === []) {
                throw $exception;
            }
            throw ValidationException::withMessages($errors);
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $this->data($target),
            'requires_reauthentication' => $request->filled('password') && $target->id === $request->user()->id,
        ]);
    }

    public function destroy(Request $request, int $user): JsonResponse
    {
        DB::transaction(function () use ($request, $user): void {
            DB::table('roles')->orderBy('id')->lockForUpdate()->get();
            $target = User::whereKey($user)->lockForUpdate()->firstOrFail();
            $this->authorizeManagement($request, $target);
            abort_if(in_array($target->role, ['admin', 'super_admin'], true) && User::where('role', $target->role)->count() <= 1, 422, 'Keep at least one '.str_replace('_', ' ', $target->role).'.');
            $images = DB::table('user_details')->where('user_id', $target->id)->first(['profile_image_path', 'cover_image_path']);
            $target->tokens()->delete();
            DB::table('sessions')->where('user_id', $target->id)->delete();
            $target->delete();
            foreach (array_filter((array) $images) as $image) {
                DB::afterCommit(fn () => Storage::disk('local')->delete($image));
            }
        });

        return response()->json(['message' => 'User deleted successfully.', 'requires_reauthentication' => $user === $request->user()->id]);
    }

    public function cover(int $user): BinaryFileResponse
    {
        return $this->image($user, 'cover_image_path');
    }

    public function image(int $user, string $column = 'profile_image_path'): BinaryFileResponse
    {
        $path = DB::table('user_details')->where('user_id', $user)->value($column);
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), [
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=300',
        ]);
    }

    private function authorizeManagement(Request $request, User $target): void
    {
        $actor = $request->user()->fresh();
        abort_unless($actor && app(RoleAccess::class)->allows($actor, 'users'), 403);
        abort_if($target->role === 'super_admin' && $actor->role !== 'super_admin', 403, 'Only a Super Admin can manage this account.');
        abort_if($target->role === 'admin' && ! in_array($actor->role, ['admin', 'super_admin'], true), 403, 'Only an administrator can manage this account.');
    }

    /** @return array<string, mixed> */
    private function data(User $user): array
    {
        $data = $user->only(['id', 'user_code', 'name', 'email', 'username', 'phone', 'role', 'created_at']);
        $details = DB::table('user_details')->where('user_id', $user->id)->first();
        foreach (['business_name', 'gstin', 'date_of_birth', 'address', 'city', 'state', 'country', 'pincode'] as $field) {
            $data[$field] = $details?->$field;
        }
        $data['profile_image_url'] = $details?->profile_image_path
            ? URL::temporarySignedRoute('users.image', now()->addMinutes(15), ['user' => $user->id, 'version' => hash('sha256', $details->profile_image_path)])
            : null;

        $data['cover_image_url'] = $details?->cover_image_path
            ? URL::temporarySignedRoute('users.cover', now()->addMinutes(15), ['user' => $user->id, 'version' => hash('sha256', $details->cover_image_path)])
            : null;

        return $data;
    }

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);
        $search = trim($data['search'] ?? '');
        $fields = ['id', 'user_code', 'name', 'email', 'username', 'phone', 'role', 'created_at'];
        $users = User::query()->select($fields)
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('username', 'like', '%'.$search.'%')->orWhere('user_code', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('role', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('name')->orderBy('id')
            ->paginate($data['per_page'] ?? 10)
            ->through(fn (User $user): array => $user->only($fields));

        return response()->json($users);
    }
}
