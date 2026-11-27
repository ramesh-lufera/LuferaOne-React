<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveTaxRequest;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TaxController extends Controller
{
    private const COLUMNS = ['id', 'name', 'region', 'rate', 'type', 'is_default'];

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])],
        ]);
        $taxes = DB::table('taxes')->select(self::COLUMNS)
            ->when($data['search'] ?? '', function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->whereLike('name', '%'.$search.'%')->orWhereLike('region', '%'.$search.'%')
                        ->orWhereLike('type', '%'.$search.'%');
                });
            })->orderByDesc('id')->paginate($data['per_page'] ?? 10)
            ->through(fn (object $tax): array => $this->details($tax));

        return response()->json($taxes);
    }

    public function show(string $tax): JsonResponse
    {
        $record = DB::table('taxes')->select(self::COLUMNS)->find($tax);
        abort_unless($record, 404);

        return response()->json(['tax' => $this->details($record)]);
    }

    public function store(SaveTaxRequest $request): JsonResponse
    {
        return $this->save($request);
    }

    public function update(SaveTaxRequest $request, string $tax): JsonResponse
    {
        $record = DB::table('taxes')->lockForUpdate()->find($tax);
        abort_unless($record, 404);

        return $this->save($request, $record);
    }

    public function destroy(Request $request, string $tax): JsonResponse
    {
        $record = DB::table('taxes')->lockForUpdate()->find($tax);
        abort_unless($record, 404);
        if (DB::table('products')->where('tax_id', $record->id)->exists()) {
            throw ValidationException::withMessages(['tax' => 'This tax is used by a product. Choose another tax or No tax on those products before deleting it.']);
        }
        if (DB::table('packages')->where('tax_id', $record->id)->exists()) {
            throw ValidationException::withMessages(['tax' => 'This tax is used by a package. Choose another tax or No tax on those packages before deleting it.']);
        }
        DB::table('taxes')->where('id', $record->id)->delete();
        $request->attributes->set('activity_entity_id', $record->id);

        return response()->json(['message' => 'Tax deleted successfully.']);
    }

    private function save(SaveTaxRequest $request, ?object $record = null): JsonResponse
    {
        $data = $request->validated();
        $defaultRegion = $request->boolean('is_default') ? Str::lower($data['region']) : null;
        if ($defaultRegion !== null) {
            DB::table('taxes')->where('default_region', $defaultRegion)
                ->when($record, fn (Builder $query): Builder => $query->where('id', '<>', $record->id))
                ->update(['is_default' => false, 'default_region' => null, 'updated_at' => now()]);
        }
        $fields = [...$data, 'is_default' => $request->boolean('is_default'), 'default_region' => $defaultRegion, 'updated_at' => now()];
        try {
            if ($record) {
                $id = $record->id;
                DB::table('taxes')->where('id', $id)->update($fields);
            } else {
                $id = DB::table('taxes')->insertGetId($fields + ['created_at' => $fields['updated_at']]);
            }
        } catch (UniqueConstraintViolationException $exception) {
            throw ValidationException::withMessages(['is_default' => 'The default tax for this region just changed. Please save again.']);
        }
        $request->attributes->set('activity_entity_id', $id);

        return response()->json(['id' => $id, 'message' => $record ? 'Tax updated successfully.' : 'Tax saved successfully.'], $record ? 200 : 201);
    }

    private function details(object $record): array
    {
        return [...(array) $record, 'is_default' => (bool) $record->is_default, 'rate' => number_format((float) $record->rate, 2, '.', '')];
    }
}
