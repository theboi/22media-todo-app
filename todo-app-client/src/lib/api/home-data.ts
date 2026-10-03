import { readTodo, type Todo } from "./list-detail";
export type HomeTodo = Todo & { listId: string; createdAt: string };
export const readHomeTodos = (value: unknown): HomeTodo[] => {
  if (!Array.isArray(value))
    throw new Error("The server returned invalid todos.");
  return value.map((item: unknown) => {
    const todo = readTodo(item);
    if (
      typeof item !== "object" ||
      item === null ||
      !("todo_list_id" in item) ||
      typeof item.todo_list_id !== "string" ||
      !("created_at" in item) ||
      typeof item.created_at !== "string" ||
      !Number.isFinite(Date.parse(item.created_at))
    )
      throw new Error("The server returned an invalid todo.");
    return { ...todo, listId: item.todo_list_id, createdAt: item.created_at };
  });
};
export const outstandingTodos = (todos: HomeTodo[]) =>
  todos
    .filter((todo) => !todo.isDone)
    .sort((a, b) => {
      const deadline =
        (a.deadline ? Date.parse(a.deadline) : Infinity) -
        (b.deadline ? Date.parse(b.deadline) : Infinity);
      return (
        (Number.isNaN(deadline) ? 0 : deadline) ||
        Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
        a.id.localeCompare(b.id)
      );
    });
export const readLayout = (value: unknown): string[] => {
  if (
    typeof value !== "object" ||
    value === null ||
    !("list_view_layout" in value) ||
    !Array.isArray(value.list_view_layout) ||
    !value.list_view_layout.every((id): id is string => typeof id === "string")
  )
    throw new Error("The server returned invalid pinned lists.");
  return value.list_view_layout;
};
