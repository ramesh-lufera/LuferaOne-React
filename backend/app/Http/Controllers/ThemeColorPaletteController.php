<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ThemeColorPaletteController extends Controller
{
    public function publicSettings(): JsonResponse
    {
        $settings = DB::table('theme_color_settings')->where('id', 1)->first(['color', 'focus', 'text']);

        return response()->json(['settings' => $settings])->header('Cache-Control', 'no-store');
    }

    public function index(Request $request): JsonResponse
    {
        $request->attributes->set('activity_page', 'Theme Colors');
        $palettes = DB::table('theme_color_palettes')->orderBy('theme_color_palettes.id')
            ->get(['uuid as id', 'label', 'color', 'focus', 'text']);

        $settings = DB::table('theme_color_settings')->where('id', 1)->first(['palette_id', 'color', 'focus', 'text']);

        return response()->json(['palettes' => $palettes, 'settings' => $settings])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $values = $request->validate([
            'id' => ['required', 'uuid'],
            'label' => ['required', 'string', 'max:100'],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'focus' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'text' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);
        $uuid = $values['id'];
        unset($values['id']);
        $created = DB::table('theme_color_palettes')->insertOrIgnore([
            ...$values, 'uuid' => $uuid, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $palette = DB::table('theme_color_palettes')->where('uuid', $uuid)
            ->first(['uuid as id', 'label', 'color', 'focus', 'text']);
        $request->attributes->set('activity_page', 'Theme Colors');
        $request->attributes->set('activity_entity_id', $uuid);
        $request->attributes->set('activity_metadata', ['palette' => (array) $palette]);
        $request->attributes->set('activity_skip', ! $created);

        return response()->json(['palette' => $palette, 'message' => 'Color palette saved successfully.'], 201);
    }

    public function update(Request $request, string $paletteId): JsonResponse
    {
        $previous = DB::table('theme_color_palettes')->where('uuid', $paletteId)->lockForUpdate()->first();
        abort_unless($previous, 404, 'Color palette not found.');
        $values = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'focus' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'text' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);
        DB::table('theme_color_palettes')->where('uuid', $paletteId)->update([...$values, 'updated_at' => now()]);
        $request->attributes->set('activity_page', 'Theme Colors');
        $request->attributes->set('activity_entity_id', $paletteId);
        $request->attributes->set('activity_metadata', [
            'before' => ['label' => $previous->label, 'color' => $previous->color, 'focus' => $previous->focus, 'text' => $previous->text],
            'after' => $values,
        ]);

        return response()->json(['palette' => ['id' => $paletteId, ...$values], 'message' => 'Color palette updated successfully.']);
    }

    public function destroy(Request $request, string $paletteId): JsonResponse
    {
        $palette = DB::table('theme_color_palettes')->where('uuid', $paletteId)->lockForUpdate()->first(['uuid as id', 'label', 'color', 'focus', 'text']);
        abort_unless($palette, 404, 'Color palette not found.');
        DB::table('theme_color_settings')->where('palette_id', $paletteId)->update(['palette_id' => 'custom', 'updated_at' => now()]);
        DB::table('theme_color_palettes')->where('uuid', $paletteId)->delete();
        $request->attributes->set('activity_page', 'Theme Colors');
        $request->attributes->set('activity_entity_id', $paletteId);
        $request->attributes->set('activity_metadata', ['palette' => (array) $palette]);
        $settings = DB::table('theme_color_settings')->where('id', 1)->first(['palette_id', 'color', 'focus', 'text']);

        return response()->json(['settings' => $settings, 'message' => 'Color palette deleted successfully.']);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $paletteIds = ['blue', 'magenta', 'orange', 'green', 'red', 'blue-dark', 'lufera-infotech', 'custom', ...DB::table('theme_color_palettes')->pluck('uuid')->all()];
        $values = $request->validate([
            'palette_id' => ['required', 'string', Rule::in($paletteIds)],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'focus' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'text' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);
        if (! in_array($values['palette_id'], ['blue', 'magenta', 'orange', 'green', 'red', 'blue-dark', 'lufera-infotech', 'custom'], true)) {
            $palette = DB::table('theme_color_palettes')->where('uuid', $values['palette_id'])->lockForUpdate()->first();
            abort_unless($palette, 422, 'This palette was deleted. Please choose another color.');
        }
        $previous = DB::table('theme_color_settings')->where('id', 1)->first(['palette_id', 'color', 'focus', 'text']);
        DB::table('theme_color_settings')->upsert([
            ['id' => 1, ...$values, 'created_at' => now(), 'updated_at' => now()],
        ], ['id'], ['palette_id', 'color', 'focus', 'text', 'updated_at']);
        $request->attributes->set('activity_page', 'Theme Colors');
        $request->attributes->set('activity_action', 'Save Changes');
        $request->attributes->set('activity_entity_id', $values['palette_id']);
        $request->attributes->set('activity_metadata', ['before' => (array) $previous, 'after' => $values]);

        return response()->json(['settings' => $values, 'message' => 'Theme Colors saved successfully.']);
    }

    public function activity(Request $request): JsonResponse
    {
        $values = $request->validate([
            'action' => ['required', Rule::in([
                'Select Color', 'Edit Custom Color', 'Reset',
                'Open Add Color', 'Cancel Add Color', 'Open Edit Color', 'Cancel Edit Color',
                'Open Delete Color', 'Cancel Delete Color',
            ])],
            'palette_id' => ['nullable', 'string', 'max:100'],
            'palette_name' => ['nullable', 'string', 'max:100'],
            'field' => ['nullable', 'in:main,focus,text'],
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'focus' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'text' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);
        $request->attributes->set('activity_page', 'Theme Colors');
        $request->attributes->set('activity_action', $values['action']);
        $request->attributes->set('activity_entity_id', $values['palette_id'] ?? null);
        unset($values['action']);
        $request->attributes->set('activity_metadata', $values);

        return response()->json(['message' => 'Activity recorded.']);
    }
}
