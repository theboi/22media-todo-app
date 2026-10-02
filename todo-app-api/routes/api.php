<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SnapshotController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\TodoListController;
use App\Http\Middleware\IdempotentMutation;
use Illuminate\Support\Facades\Route;

Route::post('auth/guest', [AuthController::class, 'guest'])->name('auth.guest')->middleware('throttle:auth-api');
Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login')->middleware('throttle:auth-api');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register')->middleware('throttle:auth-api');
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('auth/email-verification/request', [AuthController::class, 'requestVerification'])->name('auth.request');
    Route::post('auth/email-verification/confirm', [AuthController::class, 'confirm'])->name('auth.confirm')->middleware('throttle:auth-api');
    Route::get('todo-lists', [TodoListController::class, 'index'])->name('lists.index');
    Route::get('todo-lists/{id}', [TodoListController::class, 'show'])->name('lists.show');
    Route::get('todos', [TodoController::class, 'index'])->name('todos.index');
    Route::get('todos/{id}', [TodoController::class, 'show'])->name('todos.show');
    Route::get('settings', [SettingsController::class, 'show'])->name('settings.show');
    Route::get('sync/snapshot', SnapshotController::class)->name('snapshot');
    Route::middleware(IdempotentMutation::class)->group(function () {
        Route::post('todo-lists', [TodoListController::class, 'store'])->name('lists.store');
        Route::match(['PATCH', 'PUT'], 'todo-lists/{id}', [TodoListController::class, 'update'])->name('lists.update');
        Route::delete('todo-lists/{id}', [TodoListController::class, 'destroy'])->name('lists.destroy');
        Route::post('todos', [TodoController::class, 'store'])->name('todos.store');
        Route::match(['PATCH', 'PUT'], 'todos/{id}', [TodoController::class, 'update'])->name('todos.update');
        Route::delete('todos/{id}', [TodoController::class, 'destroy'])->name('todos.destroy');
        Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
    });
});
