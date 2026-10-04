import type { TodoList } from "@/lib/api/lists";

export function selectedPins(lists: TodoList[], pinned: string[], selected: string[]): string[] {
  const available = new Set(lists.map(list => list.id));
  const chosen = new Set(selected);
  return [...new Set([...pinned.filter(id => chosen.has(id)), ...selected])].filter(id => available.has(id));
}
