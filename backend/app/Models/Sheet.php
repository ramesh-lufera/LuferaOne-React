<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sheet extends Model
{
    use HasFactory;

    protected $casts = ['content' => 'array'];

    protected $fillable = ['name'];

    public function taskRowIndex(string $row): ?int
    {
        foreach ($this->content['rows'] ?? array_fill(0, 10, []) as $index => $cells) {
            if (($cells[0]['rowId'] ?? 'legacy-'.$this->id.'-'.$index) === $row) {
                return $index;
            }
        }

        return null;
    }
}
