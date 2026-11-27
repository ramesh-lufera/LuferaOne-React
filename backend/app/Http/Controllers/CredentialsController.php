<?php

namespace App\Http\Controllers;

use App\Services\SignInCredentials;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CredentialsController extends Controller
{
    public function show(SignInCredentials $credentials): JsonResponse
    {
        return response()->json(['credentials' => $credentials->values()])->header('Cache-Control', 'no-store');
    }

    public function update(Request $request, SignInCredentials $credentials): JsonResponse
    {
        $values = $request->validate([
            'emailUsername' => ['required', 'string', 'email', 'max:254', 'not_regex:/[\r\n\x00]/'],
            'gmailAppPassword' => ['required', 'string', 'max:2048', 'not_regex:/[\r\n\x00]/'],
            'emailSenderName' => ['sometimes', 'required', 'string', 'max:100', 'not_regex:/[\r\n\x00]/'],
            'emailLogo' => ['sometimes', 'required', 'file', 'mimes:png,jpg,jpeg,gif', 'max:512'],
        ]);
        try {
            $credentials->save($values);
            if (isset($values['emailLogo']) && ! Storage::disk('local')->put(SignInCredentials::EMAIL_LOGO_PATH, $values['emailLogo']->getContent())) {
                return response()->json(['message' => 'Email settings were saved, but the logo could not be uploaded.'], 503);
            }
        } catch (\Throwable $exception) {
            return response()->json(['message' => 'Unable to save email credentials. Please check server configuration and try again.'], 503);
        }

        return response()->json(['credentials' => $credentials->values(), 'message' => 'Email credentials saved successfully.'])->header('Cache-Control', 'no-store');
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
            'mobileWebOrigin' => config('cors.mobile_web_origin'),
        ])->header('Cache-Control', 'no-store');
    }
}
