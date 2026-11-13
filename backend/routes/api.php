<?php

use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'LuferaOne API is running successfully',
        'application' => 'LuferaOne',
        'version' => '1.0.0',
    ]);
});

Route::post('/register', RegisterController::class)->middleware('throttle:5,1')->name('register');
