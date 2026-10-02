<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('auth/guest', [AuthController::class, 'guest'])->name('auth.guest')->middleware('throttle:auth-api');
Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login')->middleware('throttle:auth-api');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register')->middleware('throttle:auth-api');
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('auth/email-verification/request', [AuthController::class, 'requestVerification'])->name('auth.request');
    Route::post('auth/email-verification/confirm', [AuthController::class, 'confirm'])->name('auth.confirm')->middleware('throttle:auth-api');
});
