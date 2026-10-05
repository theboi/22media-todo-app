<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\TodoList;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            throw new \RuntimeException('Demo data is only available in the local environment.');
        }

        DB::transaction(function () {
            $user = User::create([
                'email' => 'demo@eves.test',
                'password' => Hash::make('DemoPass123!'),
                'email_verified_at' => now(),
            ]);
            $account = Account::create(['user_id' => $user->id, 'has_created_list' => true]);
            $lists = [
                ['Work', 'Projects and small wins.', 'briefcase', '#5B8DEF', ['Prepare presentation', 'Review project proposal', 'Send meeting notes']],
                ['Personal', 'Make room for the everyday.', 'home', '#F59E62', ['Book a haircut', 'Organise desk', 'Call family']],
                ['Groceries', 'Fresh picks for the week.', 'cart', '#42C998', ['Buy fresh fruit', 'Pick up oat milk', 'Restock coffee']],
                ['Health', 'A little better every day.', 'heart', '#F275A1', ['Go for an evening walk', 'Schedule dental checkup', 'Drink enough water']],
                ['Study', 'Keep learning something new.', 'book', '#A384EB', ['Finish React Native lesson', 'Read Laravel auth docs', 'Review lecture notes']],
                ['Weekend', 'Things to look forward to.', 'star', '#E8B745', ['Plan a picnic', 'Try a new cafe', 'Choose a movie']],
            ];
            $pins = [];
            foreach ($lists as $index => [$name, $description, $icon, $color, $tasks]) {
                $list = TodoList::create([
                    'owner_account_id' => $account->id,
                    'name' => $name,
                    'description' => $description,
                    'icon' => $icon,
                    'color' => $color,
                    'created_at' => now()->subDays(7)->addMinutes($index),
                ]);
                if ($index < 2) {
                    $pins[] = $list->id;
                }
                foreach ($tasks as $position => $task) {
                    $done = $position === 2;
                    $list->todos()->create([
                        'name' => $task,
                        'description' => $position === 0 ? 'A small step to keep the week on track.' : null,
                        'is_done' => $done,
                        'deadline' => $position === 0 ? now()->addHours(4 + $index * 8) : null,
                        'completed_at' => $done ? now()->subHours(2 + $index) : null,
                        'version' => 1,
                        'created_at' => now()->subDays(3)->addHours($index)->addMinutes($position),
                    ]);
                }
            }
            $account->settings()->create(['list_view_layout' => $pins]);
        });
    }
}
