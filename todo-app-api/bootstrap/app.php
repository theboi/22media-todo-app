<?php

use App\Http\Middleware\ApiBoundary;
use App\Support\ApiError;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', api: __DIR__.'/../routes/api.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $m): void {
        $m->redirectGuestsTo(fn () => null);
        $m->remove([TrimStrings::class, ConvertEmptyStringsToNull::class]);
        $m->api(prepend: [ApiBoundary::class]);
    })
    ->withExceptions(function (Exceptions $e): void {
        $e->shouldRenderJsonWhen(fn (Request $r) => $r->is('api/*'));
        $e->render(function (Throwable $x, Request $r) {
            if (! $r->is('api/*')) {
                return null;
            }
            $status = 500;
            $code = 'INTERNAL_ERROR';
            $fields = [];
            $headers = [];
            if ($x instanceof ApiError) {
                $status = $x->status;
                $code = $x->errorCode;
                $fields = $x->fields;
                $headers = $x->headers;
            } elseif ($x instanceof ValidationException) {
                $status = 422;
                $code = 'VALIDATION_FAILED';
                $fields = $x->errors();
            } elseif ($x instanceof AuthenticationException) {
                $status = 401;
                $code = 'UNAUTHENTICATED';
            } elseif ($x instanceof AuthorizationException) {
                $status = 403;
                $code = 'OWNER_REQUIRED';
            } elseif ($x instanceof ModelNotFoundException) {
                $status = 404;
                $code = 'NOT_FOUND';
            } elseif ($x instanceof HttpExceptionInterface) {
                $status = $x->getStatusCode();
                $headers = $x->getHeaders();
                $code = match ($status) {
                    401 => 'UNAUTHENTICATED',403 => 'OWNER_REQUIRED',404 => 'NOT_FOUND',405 => 'METHOD_NOT_ALLOWED',429 => 'RATE_LIMITED',default => 'INTERNAL_ERROR'
                };
            }
            $headers += ['X-Eves-API-Version' => '1', 'Cache-Control' => 'no-store'];

            return response()->json(['error' => ['code' => $code, 'message' => $status === 422 ? 'The request is invalid.' : match ($status) {
                401 => 'Authentication required.',403 => 'Access denied.',404 => 'Resource not found.',409 => 'The request conflicts with existing state.',429 => 'Too many requests.',default => 'The request could not be completed.'
            }, 'fields' => (object) $fields, 'details' => (object) []]], $status, $headers);
        });
    })->create();
