<?php

namespace App\Http\Controllers;

use App\Models\Sheet;
use App\Models\SheetAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SheetAttachmentController extends Controller
{
    public function index(Sheet $sheet, string $row): JsonResponse
    {
        abort_if($sheet->taskRowIndex($row) === null, 404, 'This task row no longer exists.');

        return response()->json(['attachments' => SheetAttachment::where('sheet_id', $sheet->id)->where('row_id', $row)->with('user:id,name')->orderByDesc('id')->get()]);
    }

    public function store(Request $request, Sheet $sheet, string $row): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:20480']]);
        $attachment = DB::transaction(function () use ($request, $sheet, $row): SheetAttachment {
            $lockedSheet = Sheet::whereKey($sheet->id)->lockForUpdate()->firstOrFail();
            abort_if($lockedSheet->taskRowIndex($row) === null, 404, 'This task row no longer exists.');
            $file = $request->file('file');
            $path = $file->store('sheet-attachments/'.$sheet->id, 'local');
            abort_unless($path, 500, 'The file could not be stored.');
            DB::afterRollBack(fn () => Storage::disk('local')->delete($path));

            return SheetAttachment::create([
                'sheet_id' => $sheet->id, 'row_id' => $row, 'user_id' => $request->user()->id,
                'name' => mb_substr(basename(str_replace('\\', '/', $file->getClientOriginalName())), 0, 255),
                'path' => $path, 'mime_type' => $file->getMimeType() ?: 'application/octet-stream', 'size' => $file->getSize(),
            ]);
        });
        $request->attributes->set('activity_entity_id', $sheet->id);

        return response()->json(['attachment' => $attachment->load('user:id,name'), 'message' => 'Attachment uploaded successfully.'], 201);
    }

    public function file(Request $request, Sheet $sheet, string $row, SheetAttachment $attachment): StreamedResponse
    {
        abort_if($sheet->taskRowIndex($row) === null, 404, 'This task row no longer exists.');
        abort_unless($attachment->sheet_id === $sheet->id && $attachment->row_id === $row, 404);
        $disk = Storage::disk('local');
        abort_unless($disk->exists($attachment->path), 404, 'This file is no longer available.');
        $preview = $request->boolean('preview') && in_array($attachment->mime_type, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], true);

        return $disk->response($attachment->path, $attachment->name, [
            'Content-Type' => $preview ? $attachment->mime_type : 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store',
        ], $preview ? 'inline' : 'attachment');
    }
}
