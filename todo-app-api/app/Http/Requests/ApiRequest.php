<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ApiRequest extends FormRequest
{
    public const UUID = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D';

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'email', 'color'] as $field) {
            if ($this->exists($field) && is_string($this->input($field))) {
                $value = $this->input($field);
                $this->merge([$field => match ($field) {
                    'name' => trim($value),'email' => strtolower(trim($value)),'color' => strtoupper($value)
                }]);
            }
        }
    }

    public function rules(): array
    {
        $op = $this->route()->getName();
        $required = $this->isMethod('PUT') || $this->isMethod('POST');
        $prefix = $required ? 'required' : 'sometimes';
        $uuid = ['required', 'string', 'regex:'.self::UUID];
        $string = fn ($max) => [$prefix, 'string', 'min:1', 'max:'.$max];
        $list = ['name' => $string(120), 'description' => [$this->isMethod('PUT') ? 'present' : 'sometimes', 'nullable', 'string', 'max:2000'], 'icon' => [$prefix, 'string', Rule::in(['droplet', 'home', 'briefcase', 'book', 'heart', 'cart', 'star', 'check'])], 'color' => [$prefix, 'string', 'regex:/^#[0-9A-F]{6}$/D']];
        $todo = ['name' => $string(200), 'description' => [$this->isMethod('PUT') ? 'present' : 'sometimes', 'nullable', 'string', 'max:5000'], 'is_done' => [$prefix, function ($attribute, $value, $fail) {
            if (! is_bool($value)) {
                $fail('Must be a JSON boolean.');
            }
        }], 'deadline' => [$this->isMethod('PUT') ? 'present' : 'sometimes', 'nullable', 'string', 'regex:/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/D', 'date']];
        $email = ['required', 'string', 'email:rfc', 'max:254'];
        $rules = match ($op) {
            'auth.guest' => ['device_id' => $uuid],
            'auth.register' => ['email' => $email, 'password' => ['required', 'string', 'min:8', 'max:128', 'confirmed'], 'password_confirmation' => ['required', 'string']],
            'auth.login' => ['email' => $email, 'password' => ['required', 'string', 'min:8', 'max:128'], 'device_id' => $uuid],
            'auth.confirm' => ['code' => ['required', 'string', 'regex:/^\d{6}$/D']],
            'lists.store' => ['id' => $uuid] + $list,
            'lists.update' => $list,
            'todos.store' => ['id' => $uuid, 'todo_list_id' => $uuid] + $todo,
            'todos.update' => $todo,
            'todos.index' => ['todo_list_id' => ['sometimes', 'string', 'regex:'.self::UUID], 'is_done' => ['sometimes', 'string', Rule::in(['true', 'false'])]],
            'settings.update' => ['list_view_layout' => ['present', 'array', 'list'], 'list_view_layout.*' => ['string', 'regex:'.self::UUID, 'distinct:strict']],
            'shares.store' => ['email' => $email],
            default => []
        };
        if ($op === 'lists.store') {
            $rules['icon'][0] = 'sometimes';
            $rules['color'][0] = 'sometimes';
        }
        if ($op === 'todos.store') {
            $rules['is_done'][0] = 'sometimes';
        }

        return $rules;
    }

    public function after(): array
    {
        return [function ($validator) {
            if ($this->route()->getName() === 'settings.update') {
                $raw = json_decode($this->getContent());
                if (isset($raw->list_view_layout) && ! is_array($raw->list_view_layout)) {
                    $validator->errors()->add('list_view_layout', 'Must be a JSON array.');
                }
            }
            $allowed = array_filter(array_keys($this->rules()), fn ($x) => ! str_contains($x, '.'));
            $source = array_merge($this->query->all(), $this->json()->all());
            if ($this->route()->getName() !== 'todos.index') {
                foreach (array_keys($this->query->all()) as $key) {
                    $validator->errors()->add($key, 'Unknown query field.');
                }
            }
            foreach (array_diff(array_keys($source), $allowed) as $key) {
                $validator->errors()->add($key, 'Unknown field.');
            }
            if ($this->isMethod('PATCH') && count($this->json()->all()) === 0) {
                $validator->errors()->add('body', 'Provide at least one editable field.');
            }

        }];
    }

    public function payload(): array
    {
        $data = $this->validated();
        if (isset($data['deadline'])) {
            $data['deadline'] = Carbon::parse($data['deadline'])->utc()->format('Y-m-d H:i:s.v');
        }

        return $data;
    }
}
