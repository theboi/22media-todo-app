import { apiRequest } from "./todo-lists";
import { readTodo } from "./list-detail";
import { readHomeTodos, readLayout } from "./home-data";
export const fetchTodos = async (signal: AbortSignal) =>
  readHomeTodos(await apiRequest("/todos", signal));
export const createTodo = async (input: {
  id: string;
  listId: string;
  name: string;
  deadline?: string | null;
  key: string;
}) =>
  readTodo(
    await apiRequest(
      "/todos",
      undefined,
      { id: input.id, todo_list_id: input.listId, name: input.name, deadline: input.deadline ?? null, is_done: false },
      { method: "POST", key: input.key },
    ),
  );
export const setTodoDone = async (input: {
  id: string;
  isDone: boolean;
  key: string;
}) =>
  readTodo(
    await apiRequest(
      `/todos/${encodeURIComponent(input.id)}`,
      undefined,
      { is_done: input.isDone },
      { method: "PATCH", key: input.key },
    ),
  );
export const fetchPinnedLists = async (signal: AbortSignal) =>
  readLayout(await apiRequest("/settings", signal));
export const savePinnedLists = async (input: { ids: string[]; key: string }) =>
  readLayout(
    await apiRequest(
      "/settings",
      undefined,
      { list_view_layout: input.ids },
      { method: "PATCH", key: input.key },
    ),
  );

export const fetchTodo = async (id: string, signal: AbortSignal) => readTodo(await apiRequest(`/todos/${encodeURIComponent(id)}`, signal));
export const updateTodoDescription = async ({ id, description, key }: { id: string; description: string | null; key: string }) => readTodo(await apiRequest(`/todos/${encodeURIComponent(id)}`, undefined, { description }, { method: "PATCH", key }));
export const deleteTodo = async ({ id, key }: { id: string; key: string }) => { await apiRequest(`/todos/${encodeURIComponent(id)}`, undefined, undefined, { method: "DELETE", key }); };
