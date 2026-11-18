<?php

namespace App\Http\Controllers;

use App\Services\SignInCredentials;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CredentialsController extends Controller
{
    public function show(SignInCredentials $credentials): JsonResponse
    {
        return response()->json(['credentials' => $credentials->values()])->header('Cache-Control', 'no-store');
    }

    public function update(Request $request, SignInCredentials $credentials): JsonResponse
    {
        $rules = [];
        foreach (SignInCredentials::FIELDS as $field => $mapping) {
            $rules[$field] = ['required', 'string', 'max:2048', 'not_regex:/[\r\n\x00]/'];
        }
        $values = $request->validate($rules);
        try {
            $credentials->save($values);
        } catch (\Throwable $exception) {
            return response()->json(['message' => 'Unable to save sign-in credentials. Please check server configuration and try again.'], 503);
        }

        return response()->json(['credentials' => $credentials->values(), 'message' => 'Sign-in credentials saved successfully.'])->header('Cache-Control', 'no-store');
    }

    public function activity(Request $request): JsonResponse
    {
        $request->validate(['action' => ['required', 'in:Reset']]);
        $request->attributes->set('activity_action', 'Reset');

        return response()->json(['message' => 'No database changes to record.']);
    }

    public function publicSettings(): JsonResponse
    {
        return response()->json([
            'googleClientId' => config('services.google.client_id') ?: '',
            'facebookAppId' => config('services.facebook.app_id') ?: '',
            'facebookGraphVersion' => config('services.facebook.graph_version'),
        ])->header('Cache-Control', 'no-store');
    }
}
