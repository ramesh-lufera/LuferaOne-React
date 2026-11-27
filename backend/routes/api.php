<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\FacebookAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\MobileSignInController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CredentialsController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceSettingsController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PrivacyPolicyController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SheetAttachmentController;
use App\Http\Controllers\SheetCommentController;
use App\Http\Controllers\SheetController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\TermsConditionController;
use App\Http\Controllers\ThemeColorPaletteController;
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

Route::post('/register/verify/{pending}', [RegisterController::class, 'verify'])
    ->middleware(['signed:relative', 'throttle:6,1,signup-verification'])
    ->whereUuid('pending')
    ->name('signup.verify');

Route::get('/register/status/{pending}', [RegisterController::class, 'status'])
    ->middleware(['signed:relative', 'throttle:30,1,signup-status'])
    ->whereUuid('pending')
    ->name('signup.status');

Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', [AuthController::class, 'user'])
    ->middleware('auth:sanctum');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/auth/branding', [CompanyController::class, 'branding'])->middleware('throttle:120,1');

Route::get('/auth/settings', [CredentialsController::class, 'publicSettings']);
Route::get('/theme-color-settings', [ThemeColorPaletteController::class, 'publicSettings']);

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':theme-colors'])->group(function () {
    Route::get('/theme-color-palettes', [ThemeColorPaletteController::class, 'index']);
    Route::post('/theme-color-palettes', [ThemeColorPaletteController::class, 'store']);
    Route::post('/theme-color-palettes/activity', [ThemeColorPaletteController::class, 'activity']);
    Route::put('/theme-color-palettes/settings', [ThemeColorPaletteController::class, 'updateSettings']);
    Route::put('/theme-color-palettes/{paletteId}', [ThemeColorPaletteController::class, 'update'])->whereUuid('paletteId');
    Route::delete('/theme-color-palettes/{paletteId}', [ThemeColorPaletteController::class, 'destroy'])->whereUuid('paletteId');
});

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':credentials'])->group(function () {
    Route::get('/credentials', [CredentialsController::class, 'show']);
    Route::put('/credentials', [CredentialsController::class, 'update']);
    Route::post('/credentials/activity', [CredentialsController::class, 'activity']);
});

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
    
Route::post('/auth/mobile/start', [MobileSignInController::class, 'start'])
    ->middleware('throttle:10,1,mobile-sign-in-start');
Route::post('/auth/mobile/authorize', [MobileSignInController::class, 'authorize'])
    ->middleware(['auth:sanctum', 'throttle:10,1,mobile-sign-in-authorize']);
Route::post('/auth/mobile/exchange', [MobileSignInController::class, 'exchange'])
    ->middleware('throttle:20,1,mobile-sign-in-exchange');

// Activity Logs
Route::middleware(['auth:sanctum', 'can:view-activity-logs'])->group(function () {
    Route::get('/activity-logs/filters', [ActivityLogController::class, 'filters']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':categories'])->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->whereNumber('category');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->whereNumber('category');
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/sidebar-categories', [CategoryController::class, 'sidebar']);
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->where('category', '[a-zA-Z0-9._-]+');
});
Route::get('/categories/{category}/image', [CategoryController::class, 'image'])
    ->where('category', '[a-zA-Z0-9._-]+')->middleware(['signed', 'throttle:120,1'])->name('categories.image');
Route::get('/external/categories/{category}', [CategoryController::class, 'external'])
    ->where('category', '[a-zA-Z0-9._-]+')->middleware('throttle:120,1');

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':company'])->group(function () {
    Route::get('/company', [CompanyController::class, 'show']);
    Route::post('/company', [CompanyController::class, 'store']);
    Route::put('/company', [CompanyController::class, 'update']);
});

Route::get('/company/images/{image}', [CompanyController::class, 'image'])
    ->whereIn('image', ['logo', 'sign_in_image', 'sign_up_image', 'site_logo'])
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

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':invoice-settings'])->group(function () {
    Route::get('/invoice-settings', [InvoiceSettingsController::class, 'show']);
    Route::put('/invoice-settings', [InvoiceSettingsController::class, 'update']);
});
Route::get('/invoice-settings/logo', [InvoiceSettingsController::class, 'logo'])
    ->middleware(['signed', 'throttle:120,1'])->name('invoice-settings.logo');

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':invoices'])->group(function () {
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/next-number', [InvoiceController::class, 'nextNumber']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->whereNumber('invoice');
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->whereNumber('invoice');
});
Route::get('/invoices/{invoice}/logo', [InvoiceController::class, 'logo'])
    ->whereNumber('invoice')->middleware(['signed', 'throttle:120,1'])->name('invoices.logo');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::put('/profile/password', [UserController::class, 'changePassword'])->middleware('throttle:profile-password');
});
Route::get('/users/{user}/cover', [UserController::class, 'cover'])
    ->whereNumber('user')->middleware(['signed', 'throttle:120,1'])->name('users.cover');

Route::get('/privacy-policy', [PrivacyPolicyController::class, 'show']);
Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':privacy-policy'])->group(function () {
    Route::get('/settings/privacy-policy', [PrivacyPolicyController::class, 'show']);
    Route::match(['post', 'put'], '/settings/privacy-policy', [PrivacyPolicyController::class, 'update']);
});

Route::get('/terms-conditions', [TermsConditionController::class, 'show']);
Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':terms-conditions'])->group(function () {
    Route::get('/settings/terms-conditions', [TermsConditionController::class, 'show']);
    Route::match(['post', 'put'], '/settings/terms-conditions', [TermsConditionController::class, 'update']);
});

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':sheets'])->group(function () {
    Route::get('/sheets', [SheetController::class, 'index']);
    Route::post('/sheets', [SheetController::class, 'store']);
    Route::post('/sheets/import', [SheetController::class, 'import']);
    Route::get('/sheets/{sheet}', [SheetController::class, 'show'])->whereNumber('sheet');
    Route::put('/sheets/{sheet}', [SheetController::class, 'update'])->whereNumber('sheet');
    Route::patch('/sheets/{sheet}', [SheetController::class, 'rename'])->whereNumber('sheet');
    Route::delete('/sheets/{sheet}', [SheetController::class, 'destroy'])->whereNumber('sheet');
    Route::get('/sheets/{sheet}/rows/{row}/comments', [SheetCommentController::class, 'index'])->whereNumber('sheet')->where('row', '[a-zA-Z0-9_-]{1,100}');
    Route::post('/sheets/{sheet}/rows/{row}/comments', [SheetCommentController::class, 'store'])->whereNumber('sheet')->where('row', '[a-zA-Z0-9_-]{1,100}');
    Route::get('/sheets/{sheet}/rows/{row}/attachments', [SheetAttachmentController::class, 'index'])->whereNumber('sheet')->where('row', '[a-zA-Z0-9_-]{1,100}');
    Route::post('/sheets/{sheet}/rows/{row}/attachments', [SheetAttachmentController::class, 'store'])->whereNumber('sheet')->where('row', '[a-zA-Z0-9_-]{1,100}');
    Route::get('/sheets/{sheet}/rows/{row}/attachments/{attachment}/file', [SheetAttachmentController::class, 'file'])->whereNumber(['sheet', 'attachment'])->where('row', '[a-zA-Z0-9_-]{1,100}');
});

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':packages'])->group(function () {
    Route::get('/packages/categories', [PackageController::class, 'categories']);
    Route::get('/packages/options/taxes', [PackageController::class, 'taxes']);
    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::put('/packages/{package}', [PackageController::class, 'update'])->whereNumber('package');
    Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->whereNumber('package');
    Route::get('/packages/{package}', [PackageController::class, 'show'])->where('package', '[a-z0-9-]+');
});
Route::get('/packages/{package}/images/{image}', [PackageController::class, 'image'])
    ->where('package', '[a-z0-9-]+')->whereIn('image', ['package_image', 'breadcrumb_image', 'gallery_0', 'gallery_1', 'gallery_2', 'gallery_3'])
    ->middleware(['signed', 'throttle:120,1'])->name('packages.image');
Route::get('/external/packages/{package}', [PackageController::class, 'external'])
    ->where('package', '[a-z0-9-]+')->middleware('throttle:120,1');

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':products'])->group(function () {
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/options/taxes', [ProductController::class, 'taxes']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update'])->whereNumber('product');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->whereNumber('product');
    Route::get('/products/{product}', [ProductController::class, 'show'])->where('product', '[a-z0-9-]+');
});
Route::get('/products/{product}/images/{image}', [ProductController::class, 'image'])
    ->where('product', '[a-z0-9-]+')->whereIn('image', ['product_image', 'breadcrumb_image', 'gallery_0', 'gallery_1', 'gallery_2', 'gallery_3'])
    ->middleware(['signed', 'throttle:120,1'])->name('products.image');
Route::get('/external/products/{product}', [ProductController::class, 'external'])
    ->where('product', '[a-z0-9-]+')->middleware('throttle:120,1');

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':taxes'])->group(function () {
    Route::get('/taxes', [TaxController::class, 'index']);
    Route::post('/taxes', [TaxController::class, 'store']);
    Route::get('/taxes/{tax}', [TaxController::class, 'show'])->whereNumber('tax');
    Route::put('/taxes/{tax}', [TaxController::class, 'update'])->whereNumber('tax');
    Route::delete('/taxes/{tax}', [TaxController::class, 'destroy'])->whereNumber('tax');
});

Route::middleware(['auth:sanctum', EnsureModuleAccess::class.':marketplace'])->prefix('settings/marketplace')->group(function () {
    Route::get('/', [MarketplaceController::class, 'index']);
    Route::post('/sliders', [MarketplaceController::class, 'storeSlider']);
    Route::put('/sliders/order', [MarketplaceController::class, 'reorder']);
    Route::put('/sliders/{slider}', [MarketplaceController::class, 'updateSlider'])->whereNumber('slider');
    Route::delete('/sliders/{slider}', [MarketplaceController::class, 'destroySlider'])->whereNumber('slider');
    Route::post('/banners', [MarketplaceController::class, 'storeBanner']);
    Route::put('/banners/{banner}', [MarketplaceController::class, 'updateBanner'])->whereNumber('banner');
    Route::delete('/banners/{banner}', [MarketplaceController::class, 'destroyBanner'])->whereNumber('banner');
});
Route::get('/external/marketplace', [MarketplaceController::class, 'publicIndex'])->middleware('throttle:120,1');
Route::get('/marketplace/banners/{banner}/images/{slide}', [MarketplaceController::class, 'image'])
    ->whereNumber('banner')->whereIn('slide', ['0', '1', '2'])->middleware(['signed', 'throttle:120,1'])->name('marketplace.image');
