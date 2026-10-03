import type { TodoList } from "@/lib/api/lists";

export const unpinnedLists = (lists: TodoList[], pinned: string[]) => {
  const existing = new Set(pinned);
  return lists.filter((list) => !existing.has(list.id));
};

export const appendPins = (lists: TodoList[], pinned: string[], selected: string[]) => {
  const accessible = new Set(lists.map((list) => list.id));
  return [...new Set([...pinned, ...selected])].filter((id) => accessible.has(id));
};
