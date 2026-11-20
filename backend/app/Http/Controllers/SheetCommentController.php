<?php

namespace App\Http\Controllers;

use App\Models\Sheet;
use App\Models\SheetComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SheetCommentController extends Controller
{
    private function ensureRowExists(Sheet $sheet, string $row): void
    {
        abort_if($sheet->taskRowIndex($row) === null, 404, 'This task row no longer exists.');
    }

    public function index(Sheet $sheet, string $row): JsonResponse
    {
        $this->ensureRowExists($sheet, $row);

        return response()->json(['comments' => SheetComment::query()->where('sheet_id', $sheet->id)->where('row_id', $row)->with('user:id,name')->orderBy('id')->get()]);
    }

    public function store(Request $request, Sheet $sheet, string $row): JsonResponse
    {
        if (is_string($request->input('body'))) {
            $request->merge(['body' => trim($request->input('body'))]);
        }
        $data = $request->validate(['body' => ['required', 'string', 'max:5000'], 'parent_id' => ['nullable', 'integer', 'min:1']]);
        $comment = DB::transaction(function () use ($request, $sheet, $row, $data): SheetComment {
            $lockedSheet = Sheet::whereKey($sheet->id)->lockForUpdate()->firstOrFail();
            $this->ensureRowExists($lockedSheet, $row);
            if (! empty($data['parent_id'])) {
                abort_unless(SheetComment::whereKey($data['parent_id'])->where('sheet_id', $sheet->id)->where('row_id', $row)->exists(), 422, 'The message you are replying to does not belong to this task.');
            }

            return SheetComment::create(['sheet_id' => $sheet->id, 'row_id' => $row, 'user_id' => $request->user()->id, 'parent_id' => $data['parent_id'] ?? null, 'body' => $data['body']]);
        });
        $request->attributes->set('activity_entity_id', $sheet->id);

        return response()->json(['comment' => $comment->load('user:id,name')], 201);
    }
}
