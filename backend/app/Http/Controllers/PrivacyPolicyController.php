<?php

namespace App\Http\Controllers;

use App\Models\PrivacyPolicy;
use App\Services\PrivacyPolicySanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PrivacyPolicyController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['policy' => PrivacyPolicy::findOrFail(1)])->header('Cache-Control', 'no-store');
    }

    public function update(Request $request, PrivacyPolicySanitizer $sanitizer): JsonResponse
    {
        $data = $request->validate(['content' => ['required', 'string', 'max:200000']]);
        $content = $sanitizer->sanitize($data['content']);
        if (trim(str_replace("\xc2\xa0", ' ', html_entity_decode(strip_tags($content)))) === '') {
            throw ValidationException::withMessages(['content' => 'Please enter Privacy Policy content.']);
        }
        $policy = PrivacyPolicy::findOrFail(1);
        $policy->update(['content' => $content]);

        return response()->json(['policy' => $policy, 'message' => 'Privacy Policy saved successfully.'])->header('Cache-Control', 'no-store');
    }
}
