import { readLists, type TodoList } from "./lists";
export type Todo = {
  id: string;
  name: string;
  description: string | null;
  isDone: boolean;
  deadline: string | null;
};
export type ListDetail = TodoList & { todos: Todo[] };
export const readListDetail = (value: unknown): ListDetail => {
  const [list] = readLists([value]);
  if (
    !list ||
    typeof value !== "object" ||
    value === null ||
    !("todos" in value) ||
    !Array.isArray(value.todos)
  )
    throw new Error("The server returned an invalid list.");
  const todos = value.todos.map((item: unknown): Todo => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("id" in item) ||
      typeof item.id !== "string" ||
      !("name" in item) ||
      typeof item.name !== "string" ||
      !("description" in item) ||
      !(item.description === null || typeof item.description === "string") ||
      !("is_done" in item) ||
      typeof item.is_done !== "boolean" ||
      !("deadline" in item) ||
      !(
        item.deadline === null ||
        (typeof item.deadline === "string" &&
          Number.isFinite(Date.parse(item.deadline)))
      )
    )
      throw new Error("The server returned an invalid todo.");
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      isDone: item.is_done,
      deadline: item.deadline,
    };
  });
  return { ...list, todos };
};
