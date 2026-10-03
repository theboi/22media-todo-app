import type { Todo } from "@/lib/api/list-detail";

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    if (a.isDone) {
      return Date.parse(a.completedAt ?? "") - Date.parse(b.completedAt ?? "") || a.id.localeCompare(b.id);
    }
    const deadline = (a.deadline ? Date.parse(a.deadline) : Infinity) - (b.deadline ? Date.parse(b.deadline) : Infinity);
    return (Number.isNaN(deadline) ? 0 : deadline) || Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id);
  });
}
