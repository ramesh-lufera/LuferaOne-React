
<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\FacebookAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
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
