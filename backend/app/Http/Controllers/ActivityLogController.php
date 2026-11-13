<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'draw' => ['sometimes', 'integer', 'min:0'], 'start' => ['sometimes', 'integer', 'min:0', 'max:10000000'],
            'length' => ['sometimes', 'integer', 'min:1', 'max:100'], 'search.value' => ['nullable', 'string', 'max:200'],
            'order.0.column' => ['sometimes', 'integer', 'between:0,5'], 'order.0.dir' => ['sometimes', 'in:asc,desc'],
            'module' => ['nullable', 'string', 'max:100'], 'action' => ['nullable', 'string', 'max:30'],
            'user' => ['nullable', 'string', 'max:300'],
            'date_from' => ['nullable', 'date_format:Y-m-d'], 'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);
        $pageModule = ActivityLog::pageModuleExpression();
        $pageDescription = ActivityLog::pageDescriptionExpression();
        $query = ActivityLog::query()->selectRaw('activity_logs.*, '.$pageModule.' AS page_module, '.$pageDescription.' AS page_description');
        foreach (['action'] as $field) {
            if (isset($data[$field])) {
                $query->where($field, $data[$field]);
            }
        }
        if (isset($data['module'])) {
            $query->whereRaw('('.$pageModule.') = ?', [$data['module']]);
        }
        if (! empty($data['user'])) {
            if (str_starts_with($data['user'], 'id:') && ctype_digit(substr($data['user'], 3))) {
                $query->where('user_id', substr($data['user'], 3));
            } else {
                $query->whereNull('user_id')->where('user_name', $data['user']);
            }
        }
        $timezone = config('activity.timezone');
        if (! empty($data['date_from'])) {
            $query->where('occurred_at', '>=', CarbonImmutable::parse($data['date_from'], $timezone)->startOfDay()->utc());
        }
        if (! empty($data['date_to'])) {
            $query->where('occurred_at', '<', CarbonImmutable::parse($data['date_to'], $timezone)->addDay()->startOfDay()->utc());
        }
        $search = $data['search']['value'] ?? '';
        if ($search !== '') {
            $query->where(function (Builder $query) use ($search, $pageModule, $pageDescription) {
                $query->orWhereRaw('('.$pageModule.') like ?', ['%'.$search.'%']);
                $query->orWhereRaw('('.$pageDescription.') like ?', ['%'.$search.'%']);
                foreach (['action', 'module', 'description', 'user_name', 'username'] as $field) {
                    $query->orWhere($field, 'like', '%'.$search.'%');
                }
            });
        }
        $total = ActivityLog::count();
        $filtered = (clone $query)->count();
        $columns = ['id', 'action', 'page_module', 'page_description', 'user_name', 'occurred_at'];
        $sort = $columns[$data['order'][0]['column'] ?? 5];
        $direction = $data['order'][0]['dir'] ?? 'desc';
        $start = $data['start'] ?? 0;
        $logs = $query->orderBy($sort, $direction)->when($sort !== 'id', fn (Builder $query) => $query->orderBy('id', $direction))->offset($start)->limit($data['length'] ?? 10)->get();

        return response()->json(['draw' => (int) ($data['draw'] ?? 0), 'recordsTotal' => $total, 'recordsFiltered' => $filtered, 'timezone' => $timezone,
            'data' => $logs->values()->map(function (ActivityLog $log, int $index) use ($start, $timezone) {
                $local = $log->occurred_at->setTimezone($timezone);

                return ['id' => $log->id, 'serial' => $start + $index + 1, 'action' => $log->action, 'module' => $log->page_module,
                    'description' => $log->page_description, 'user_id' => $log->user_id, 'username' => $log->username, 'user_name' => $log->user_name,
                    'entity_id' => $log->entity_id, 'occurred_at' => $log->occurred_at->toIso8601String(), 'date_time' => $local->format('d M Y H:i:s'), 'date' => $local->format('d M Y'), 'time' => $local->format('H:i:s')];
            })]);
    }

    public function filters(): JsonResponse
    {
        return response()->json([
            'modules' => ActivityLog::selectRaw(ActivityLog::pageModuleExpression().' AS page_module')->distinct()->orderBy('page_module')->get()->pluck('page_module'),
            'actions' => ActivityLog::distinct()->orderBy('action')->pluck('action'),
            'users' => ActivityLog::select('user_id', 'user_name')->distinct()->orderBy('user_name')->get()->map(fn (ActivityLog $log) => ['value' => $log->user_id !== null ? 'id:'.$log->user_id : $log->user_name, 'name' => $log->user_name]),
            'timezone' => config('activity.timezone'),
        ]);
    }
}
