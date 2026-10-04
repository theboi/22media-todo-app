import type { Todo } from "@/lib/api/list-detail";
export type TodoRowContentProps = { todo: Todo; supporting: string; disabled: boolean; onToggle(): void; onDescription(): void };
