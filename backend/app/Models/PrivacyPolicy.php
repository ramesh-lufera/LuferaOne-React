<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivacyPolicy extends Model
{
    public $incrementing = false;

    protected $fillable = ['content'];
}
