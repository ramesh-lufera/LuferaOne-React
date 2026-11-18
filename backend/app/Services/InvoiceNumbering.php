<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class InvoiceNumbering
{
    public const MAX_SERIES = 999999999999;

    public function number(object $settings, int $series): string
    {
        return $settings->prefix.str_pad((string) $series, $settings->series_width, '0', STR_PAD_LEFT).$settings->suffix;
    }

    public function nextAvailable(object $settings, int $series): int
    {
        while ($series <= self::MAX_SERIES && DB::table('invoices')->where('invoice_number', $this->number($settings, $series))->lockForUpdate()->first(['id']) !== null) {
            $series++;
        }

        return $series;
    }

    /** @param array<string, mixed> $data */
    public function create(array $data, int $actor): object
    {
        return DB::transaction(function () use ($data, $actor): object {
            $settings = DB::table('invoice_settings')->where('id', 1)->lockForUpdate()->firstOrFail();
            $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
            $existing = DB::table('invoices')->where('request_id', $data['request_id'])->lockForUpdate()->first();
            if ($existing) {
                abort_unless(hash_equals($existing->request_hash, $hash), 409, 'This save request was already used for a different invoice. Reload before creating another invoice.');

                return $existing;
            }
            $series = $this->nextAvailable($settings, (int) $settings->next_number);
            abort_if($series > self::MAX_SERIES, 409, 'The invoice series is exhausted. Update Invoice Settings to continue.');
            $id = DB::table('invoices')->insertGetId([
                ...$this->invoiceFields($data),
                'invoice_number' => $this->number($settings, $series),
                'request_id' => $data['request_id'], 'request_hash' => $hash,
                'logo_path' => $settings->logo_path, 'created_by' => $actor,
                'updated_by' => $actor, 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('invoice_settings')->where('id', 1)->update([
                'next_number' => $this->nextAvailable($settings, $series + 1),
                'version' => $settings->version + 1, 'updated_at' => now(),
            ]);

            return DB::table('invoices')->where('id', $id)->firstOrFail();
        }, 3);
    }

    /** @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function invoiceFields(array $data): array
    {
        $total = 0;
        $items = [];
        foreach ($data['items'] as $item) {
            $price = explode('.', (string) $item['unit_price']);
            $cents = (int) $price[0] * 100 + (int) str_pad($price[1] ?? '', 2, '0');
            $lineTotal = $cents * (int) $item['quantity'];
            $total += $lineTotal;
            $items[] = [
                'description' => $item['description'], 'quantity' => (int) $item['quantity'],
                'unit' => $item['unit'] ?? '',
                'unit_price' => intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT),
                'line_total_cents' => $lineTotal,
            ];
        }

        return [
            'customer_name' => $data['customer_name'], 'customer_email' => $data['customer_email'] ?? null,
            'customer_address' => $data['customer_address'] ?? null, 'customer_phone' => $data['customer_phone'] ?? null,
            'issued_on' => $data['issued_on'], 'due_on' => $data['due_on'] ?? null,
            'items' => json_encode($items, JSON_THROW_ON_ERROR), 'total_cents' => $total, 'notes' => $data['notes'] ?? null,
        ];
    }
}
