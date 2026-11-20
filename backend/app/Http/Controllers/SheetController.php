<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSheetRequest;
use App\Models\Sheet;
use App\Models\SheetAttachment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SheetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])],
        ]);
        $sheets = Sheet::query()->select('id', 'name', 'created_at', 'updated_at')
            ->when($data['search'] ?? '', fn (Builder $query, string $search): Builder => $query->where('name', 'like', '%'.$search.'%'))
            ->orderByDesc('id')->paginate($data['per_page'] ?? 10);

        return response()->json($sheets);
    }

    public function store(StoreSheetRequest $request): JsonResponse
    {
        $sheet = new Sheet($request->validated());
        $sheet->created_by = $request->user()->id;
        $sheet->save();
        request()->attributes->set('activity_entity_id', $sheet->id);

        return response()->json(['sheet' => $sheet->only(['id', 'name', 'created_at']), 'message' => 'Sheet created successfully.'], 201);
    }

    public function show(Sheet $sheet): JsonResponse
    {
        return response()->json(['sheet' => $sheet->only(['id', 'name', 'content', 'version', 'updated_at'])]);
    }

    public function rename(StoreSheetRequest $request, Sheet $sheet): JsonResponse
    {
        $sheet->update($request->validated());
        $request->attributes->set('activity_entity_id', $sheet->id);

        return response()->json(['sheet' => $sheet->only(['id', 'name', 'created_at', 'updated_at']), 'message' => 'Sheet renamed successfully.']);
    }

    public function destroy(Request $request, Sheet $sheet): JsonResponse
    {
        $request->attributes->set('activity_entity_id', $sheet->id);
        DB::transaction(function () use ($sheet): void {
            $lockedSheet = Sheet::whereKey($sheet->id)->lockForUpdate()->firstOrFail();
            $paths = SheetAttachment::where('sheet_id', $sheet->id)->pluck('path')->all();
            $lockedSheet->delete();
            DB::afterCommit(fn () => Storage::disk('local')->delete($paths));
        });

        return response()->json(['message' => 'Sheet deleted successfully.']);
    }

    public function update(Request $request, Sheet $sheet): JsonResponse
    {
        $data = $request->validate([
            'version' => ['required', 'integer', 'min:0'],
            'content' => ['required', 'array:rows'],
            'content.rows' => ['required', 'array', 'list', 'min:1', 'max:200'],
            'content.rows.*' => ['required', 'array', 'list', 'min:4', 'max:5'],
            'content.rows.*.*' => ['required', 'array:value,bold,italic,underline,fontFamily,fontSize,color,backgroundColor,textAlign,rowId'],
            'content.rows.*.0.rowId' => ['sometimes', 'required', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_-]+$/', 'distinct'],
            'content.rows.*.*.value' => ['present', 'nullable', 'string', 'max:2000'],
            'content.rows.*.*.bold' => ['sometimes', 'boolean'],
            'content.rows.*.*.italic' => ['sometimes', 'boolean'],
            'content.rows.*.*.underline' => ['sometimes', 'boolean'],
            'content.rows.*.*.fontFamily' => ['sometimes', Rule::in(['Arial', 'Georgia', 'Verdana'])],
            'content.rows.*.*.fontSize' => ['sometimes', 'integer', Rule::in([12, 14, 16, 18, 24])],
            'content.rows.*.*.color' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'content.rows.*.*.backgroundColor' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'content.rows.*.*.textAlign' => ['sometimes', Rule::in(['left', 'center', 'right'])],
        ]);
        $updated = Sheet::whereKey($sheet->id)->where('version', $data['version'])->update([
            'content' => json_encode($data['content']), 'version' => $data['version'] + 1, 'updated_at' => now(),
        ]);
        abort_unless($updated, 409, 'This sheet changed in another session. Reload before saving again.');
        $request->attributes->set('activity_entity_id', $sheet->id);

        return response()->json(['sheet' => $sheet->fresh()->only(['id', 'name', 'content', 'version', 'updated_at']), 'message' => 'Sheet saved successfully.']);
    }
}
