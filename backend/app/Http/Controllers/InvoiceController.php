<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveInvoiceRequest;
use App\Services\InvoiceNumbering;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['search' => ['nullable', 'string', 'max:255'], 'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])]]);
        $search = $data['search'] ?? '';
        $invoices = DB::table('invoices')->select('id', 'invoice_number', 'customer_name', 'issued_on', 'due_on', 'total_cents')
            ->where(function ($query) use ($search): void {
                $query->where('invoice_number', 'like', '%'.$search.'%')->orWhere('customer_name', 'like', '%'.$search.'%');
            })->orderByDesc('id')->paginate($data['per_page'] ?? 10);

        return response()->json($invoices);
    }

    public function nextNumber(InvoiceNumbering $numbering): JsonResponse
    {
        $settings = DB::table('invoice_settings')->where('id', 1)->firstOrFail();

        return response()->json([
            'next_invoice_number' => $settings->next_number <= InvoiceNumbering::MAX_SERIES ? $numbering->number($settings, (int) $settings->next_number) : null,
            'logo_url' => $settings->logo_path ? URL::temporarySignedRoute('invoice-settings.logo', now()->addMinutes(15), ['v' => hash('sha256', $settings->logo_path)]) : null,
        ]);
    }

    public function store(SaveInvoiceRequest $request, InvoiceNumbering $numbering): JsonResponse
    {
        $invoice = $numbering->create($request->validated(), $request->user()->id);
        request()->attributes->set('activity_entity_id', $invoice->id);

        return response()->json(['message' => 'Invoice created successfully.', 'invoice' => $this->data($invoice)], 201);
    }

    public function show(int $invoice): JsonResponse
    {
        return response()->json(['invoice' => $this->data(DB::table('invoices')->where('id', $invoice)->firstOrFail())]);
    }

    public function update(SaveInvoiceRequest $request, int $invoice, InvoiceNumbering $numbering): JsonResponse
    {
        $record = DB::transaction(function () use ($request, $invoice, $numbering): object {
            DB::table('invoices')->where('id', $invoice)->lockForUpdate()->firstOrFail();
            DB::table('invoices')->where('id', $invoice)->update([
                ...$numbering->invoiceFields($request->validated()),
                'updated_by' => $request->user()->id, 'updated_at' => now(),
            ]);

            return DB::table('invoices')->where('id', $invoice)->firstOrFail();
        }, 3);

        return response()->json(['message' => 'Invoice updated successfully.', 'invoice' => $this->data($record)]);
    }

    public function logo(int $invoice): BinaryFileResponse
    {
        $path = DB::table('invoices')->where('id', $invoice)->value('logo_path');
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, max-age=300']);
    }

    /** @return array<string, mixed> */
    private function data(object $invoice): array
    {
        $data = (array) $invoice;
        unset($data['request_hash'], $data['request_id'], $data['logo_path']);
        $data['items'] = json_decode($invoice->items, true, flags: JSON_THROW_ON_ERROR);
        $data['logo_url'] = $invoice->logo_path ? URL::temporarySignedRoute('invoices.logo', now()->addMinutes(15), ['invoice' => $invoice->id]) : null;

        return $data;
    }
}
