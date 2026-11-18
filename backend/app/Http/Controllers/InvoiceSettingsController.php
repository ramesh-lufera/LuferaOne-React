<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveInvoiceSettingsRequest;
use App\Services\InvoiceNumbering;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceSettingsController extends Controller
{
    public function show(InvoiceNumbering $numbering): JsonResponse
    {
        return response()->json(['settings' => $this->data(DB::table('invoice_settings')->where('id', 1)->firstOrFail(), $numbering)]);
    }

    public function update(SaveInvoiceSettingsRequest $request, InvoiceNumbering $numbering): JsonResponse
    {
        $settings = DB::transaction(function () use ($request, $numbering): object {
            $settings = DB::table('invoice_settings')->where('id', 1)->lockForUpdate()->firstOrFail();
            abort_unless((int) $settings->version === $request->integer('version'), 409, 'Invoice settings changed while you were editing. Reload the saved settings and try again.');
            $previousLogo = $settings->logo_path;
            $settings->prefix = (string) $request->validated('prefix');
            $settings->suffix = (string) $request->validated('suffix');
            $settings->series_width = strlen($request->validated('series'));
            $settings->next_number = $numbering->nextAvailable($settings, (int) $request->validated('series'));
            abort_if($settings->next_number > InvoiceNumbering::MAX_SERIES, 422, 'This series is exhausted. Choose a different prefix, suffix or starting series.');
            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('invoice-logos', 'local');
                if (! $path) {
                    throw new \RuntimeException('Invoice logo could not be stored.');
                }
                DB::afterRollBack(fn () => Storage::disk('local')->delete($path));
                $settings->logo_path = $path;
            } elseif ($request->boolean('remove_logo')) {
                $settings->logo_path = null;
            }
            DB::table('invoice_settings')->where('id', 1)->update([
                'prefix' => $settings->prefix, 'suffix' => $settings->suffix,
                'series_width' => $settings->series_width, 'next_number' => $settings->next_number,
                'logo_path' => $settings->logo_path, 'version' => $settings->version + 1,
                'updated_by' => $request->user()->id, 'updated_at' => now(),
            ]);
            if ($previousLogo && $previousLogo !== $settings->logo_path) {
                DB::afterCommit(function () use ($previousLogo): void {
                    if (! DB::table('invoices')->where('logo_path', $previousLogo)->exists()) {
                        Storage::disk('local')->delete($previousLogo);
                    }
                });
            }

            return DB::table('invoice_settings')->where('id', 1)->firstOrFail();
        }, 3);
        request()->attributes->set('activity_entity_id', '1');

        return response()->json(['message' => 'Invoice settings updated successfully.', 'settings' => $this->data($settings, $numbering)]);
    }

    public function logo(Request $request): BinaryFileResponse
    {
        $path = DB::table('invoice_settings')->where('id', 1)->value('logo_path');
        abort_unless($path && hash_equals(hash('sha256', $path), (string) $request->query('v')) && Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, max-age=300']);
    }

    /** @return array<string, mixed> */
    private function data(object $settings, InvoiceNumbering $numbering): array
    {
        return [
            'prefix' => $settings->prefix,
            'series' => str_pad((string) $settings->next_number, $settings->series_width, '0', STR_PAD_LEFT),
            'suffix' => $settings->suffix, 'version' => (int) $settings->version,
            'next_invoice_number' => $settings->next_number <= InvoiceNumbering::MAX_SERIES ? $numbering->number($settings, (int) $settings->next_number) : null,
            'logo_url' => $settings->logo_path ? URL::temporarySignedRoute('invoice-settings.logo', now()->addMinutes(15), ['v' => hash('sha256', $settings->logo_path)]) : null,
        ];
    }
}
