<?php

namespace App\Http\Middleware;

use App\Support\ApiError;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiBoundary
{
    public function handle(Request $request, Closure $next)
    {
        Auth::forgetGuards();
        if (! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
            if ($request->getContent() !== '') {
                if (! $request->isJson()) {
                    throw new ApiError('UNSUPPORTED_MEDIA_TYPE', 415);
                }
                try {
                    $body = json_decode($request->getContent(), false, 512, JSON_THROW_ON_ERROR);
                    if (! is_object($body)) {
                        throw new \JsonException;
                    }
                } catch (\JsonException) {
                    throw new ApiError('INVALID_JSON', 400);
                }
            }
        }
        $response = $next($request);
        $response->headers->set('X-Eves-API-Version', '1');
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
