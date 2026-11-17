<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCompanyRequest;
use App\Models\Company;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CompanyController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $company = Company::where('profile_key', 'shared')->first();
        $request->attributes->set('activity_page', 'Company');
        if ($company) {
            $request->attributes->set('activity_entity_id', $company->id);
        }

        return response()->json(['company' => $company ? $this->data($company) : null]);
    }

    public function store(SaveCompanyRequest $request): JsonResponse
    {
        abort_if(Company::where('profile_key', 'shared')->exists(), 409, 'The company profile already exists. Reload to edit it.');
        try {
            return $this->save($request, new Company);
        } catch (UniqueConstraintViolationException $exception) {
            throw ValidationException::withMessages(['full_name' => ['The company profile already exists. Reload to edit it.']]);
        }
    }

    public function update(SaveCompanyRequest $request): JsonResponse
    {
        return $this->save($request, Company::where('profile_key', 'shared')->lockForUpdate()->firstOrFail());
    }

    private function save(SaveCompanyRequest $request, Company $company): JsonResponse
    {
        $created = ! $company->exists;
        $company->fill($request->safe()->only($company->getFillable()));
        $company->profile_key = 'shared';
        if ($created) {
            $company->created_by = $request->user()->id;
        }
        $company->updated_by = $request->user()->id;
        foreach (['logo', 'sign_in_image', 'sign_up_image'] as $field) {
            $column = $field.'_path';
            $previous = $company->$column;
            if ($request->hasFile($field)) {
                $path = $request->file($field)->store('companies', 'local');
                if (! $path) {
                    throw new RuntimeException('Company image could not be stored.');
                }
                DB::afterRollBack(fn () => Storage::disk('local')->delete($path));
                $company->$column = $path;
            } elseif ($request->boolean('remove_'.$field)) {
                $company->$column = null;
            }
            if ($previous && $previous !== $company->$column) {
                DB::afterCommit(fn () => Storage::disk('local')->delete($previous));
            }
        }
        $company->save();
        request()->attributes->set('activity_page', 'Company');
        request()->attributes->set('activity_entity_id', $company->id);

        return response()->json(['message' => 'Company profile saved successfully.', 'company' => $this->data($company)], $created ? 201 : 200);
    }

    public function image(string $image): BinaryFileResponse
    {
        $company = Company::where('profile_key', 'shared')->firstOrFail();
        $path = $company->{$image.'_path'};
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), [
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=300',
        ]);
    }

    private function data(Company $company): array
    {
        $data = $company->only(array_merge(['id'], $company->getFillable(), ['created_at', 'updated_at']));
        foreach (['logo', 'sign_in_image', 'sign_up_image'] as $field) {
            $path = $company->{$field.'_path'};
            $data[$field.'_url'] = $path ? URL::temporarySignedRoute('company.image', now()->addHour(), ['image' => $field]) : null;
        }

        return $data;
    }
}
