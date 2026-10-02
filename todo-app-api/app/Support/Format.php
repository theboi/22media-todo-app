<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class Format
{
    public static function time($value): ?string
    {
        return $value ? Carbon::parse($value)->utc()->format('Y-m-d\TH:i:s.v\Z') : null;
    }
}
