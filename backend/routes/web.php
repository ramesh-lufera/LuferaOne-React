<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::view('/signup/verify', 'signup-verify')->name('signup.verify-page');
