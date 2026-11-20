<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SheetAttachment extends Model
{
    use HasFactory;

    protected $fillable = ['sheet_id', 'row_id', 'user_id', 'name', 'path', 'mime_type', 'size'];

    protected $hidden = ['path'];
}
