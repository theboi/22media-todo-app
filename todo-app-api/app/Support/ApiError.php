<?php

namespace App\Support;

class ApiError extends \RuntimeException
{
    public function __construct(public readonly string $errorCode, public readonly int $status, public readonly array $fields = [], public readonly array $headers = [])
    {
        parent::__construct($errorCode);
    }
}
