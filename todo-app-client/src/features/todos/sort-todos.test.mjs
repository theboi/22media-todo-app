import test from 'node:test';
import assert from 'node:assert/strict';
import { sortTodos } from './sort-todos.ts';
import { readTodo } from '../../lib/api/list-detail.ts';

test('detail orders incomplete deadlines then newest additions, completed by completion time', () => {
  const todo = (id, deadline, createdAt, completedAt = null) => ({ id, deadline, createdAt, completedAt, isDone: completedAt !== null });
  const input = [
    todo('done-later', null, '2026-10-01', '2026-10-04T13:00:00Z'),
    todo('undated-old', null, '2026-10-01'),
    todo('deadline-old', '2026-10-05', '2026-10-01'),
    todo('deadline-new', '2026-10-05', '2026-10-03'),
    todo('soon', '2026-10-04', '2026-10-01'),
    todo('undated-new', null, '2026-10-03'),
    todo('done-first', null, '2026-10-03', '2026-10-04T12:00:00Z'),
  ];
  assert.deepEqual(sortTodos(input).map(t => t.id), ['soon', 'deadline-new', 'deadline-old', 'undated-new', 'undated-old', 'done-first', 'done-later']);
  assert.equal(input[0].id, 'done-later');
});

test('detail breaks identical timestamp ties by id', () => {
  const a = {id:'a', deadline:null, createdAt:'2026-10-04', completedAt:null, isDone:false};
  assert.deepEqual(sortTodos([{...a,id:'b'}, a]).map(t => t.id), ['a','b']);
});

test('todo parser retains completion metadata and rejects invalid or missing dates', () => {
  const data = {id:'id',todo_list_id:'list-id', name:'Task', description:null, is_done:true, deadline:null, created_at:'2026-10-03T12:00:00Z',completed_at:'2026-10-04T12:00:00Z'};
  assert.equal(readTodo(data).completedAt, data.completed_at);
  assert.equal(readTodo(data).listId, 'list-id');
  assert.equal(readTodo(data).createdAt, data.created_at);
  assert.throws(() => readTodo({...data,completed_at:'invalid'}), /invalid todo/);
  assert.throws(() => readTodo({...data,completed_at:null}), /invalid todo/);
  assert.throws(() => readTodo({...data,is_done:false}), /invalid todo/);
  assert.throws(() => readTodo({...data,created_at:undefined}), /invalid todo/);
});
