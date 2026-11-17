<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\FacebookAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureModuleAccess;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'LuferaOne API is running successfully',
        'application' => 'LuferaOne',
        'version' => '1.0.0',
    ]);
});

Route::post('/register', RegisterController::class)
    ->middleware('throttle:5,1')
    ->name('register');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::get('/user', [AuthController::class, 'user'])
    ->middleware('auth:sanctum');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

// Google Authentication
Route::get('/auth/google/nonce', [GoogleAuthController::class, 'nonce'])
    ->middleware('throttle:30,1,google-nonce');

Route::post('/auth/google', GoogleAuthController::class)
    ->middleware('throttle:10,1,google-login');

Route::post('/auth/google/code', [GoogleAuthController::class, 'code'])
    ->middleware('throttle:10,1,google-login');

// Facebook Authentication
Route::post('/auth/facebook', FacebookAuthController::class)
    ->middleware('throttle:10,1,facebook-login');

// Activity Logs
Route::middleware(['auth:sanctum', 'can:view-activity-logs'])->group(function () {
    Route::get('/activity-logs/filters', [ActivityLogController::class, 'filters']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':company'])->group(function () {
    Route::get('/company', [CompanyController::class, 'show']);
    Route::post('/company', [CompanyController::class, 'store']);
    Route::put('/company', [CompanyController::class, 'update']);
});

Route::get('/company/images/{image}', [CompanyController::class, 'image'])
    ->whereIn('image', ['logo', 'sign_in_image', 'sign_up_image'])
    ->middleware(['signed', 'throttle:120,1'])
    ->name('company.image');

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':roles'])->group(function () {
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{role}', [RoleController::class, 'update'])->whereNumber('role');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->whereNumber('role');
    Route::get('/role-users', [RoleController::class, 'users']);
    Route::put('/role-users/{user}', [RoleController::class, 'assign'])->whereNumber('user');
});

Route::get('/users', [UserController::class, 'index'])
    ->middleware(['auth:sanctum', EnsureModuleAccess::class.':users']);

Route::post('/users', [UserController::class, 'store'])
    ->middleware(['auth:sanctum', EnsureModuleAccess::class.':users']);

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':users'])->group(function () {
    Route::get('/users/{user}', [UserController::class, 'show'])->whereNumber('user');
    Route::put('/users/{user}', [UserController::class, 'update'])->whereNumber('user');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->whereNumber('user');
});

Route::get('/users/{user}/image', [UserController::class, 'image'])
    ->whereNumber('user')
    ->middleware(['signed', 'throttle:120,1'])
    ->name('users.image');
