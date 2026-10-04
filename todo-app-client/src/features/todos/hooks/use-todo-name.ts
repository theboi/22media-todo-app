import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { updateTodoName } from "@/lib/api/todos";
import { invalidateList } from "@/lib/api/invalidate-list";
import type { Todo } from "@/lib/api/list-detail";

export function useTodoName(todo: Todo, disabled: boolean) {
  const client = useQueryClient();
  const draftRef = useRef(todo.name);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.name);
  const [validation, setValidation] = useState<string>();
  const attempt = useRef<Parameters<typeof updateTodoName>[0] | null>(null);
  const saving = useRef(false);
  const save = useMutation({ mutationFn: updateTodoName, networkMode: "always", onSettled: () => { saving.current = false; }, onSuccess: async value => {
    setEditing(false);
    client.setQueryData(["todo", todo.id], value);
    await invalidateList(client, todo.listId);
  } });
  const submit = () => {
    if (saving.current || disabled) return;
    const name = draftRef.current.trim();
    if (!name) { setValidation("Enter a todo name."); return; }
    if (name === todo.name) { setEditing(false); return; }
    if (!attempt.current || attempt.current.name !== name) attempt.current = { id: todo.id, name, key: randomUUID() };
    saving.current = true;
    save.mutate(attempt.current);
  };
  const start = () => {
    if (disabled || saving.current) return;
    draftRef.current = todo.name;
    setDraft(todo.name);
    setValidation(undefined);
    save.reset();
    setEditing(true);
  };
  const change = (value: string) => { draftRef.current = value; setDraft(value); setValidation(undefined); };
  return { editing, draft, error: validation ?? save.error?.message, pending: save.isPending, start, change, submit };
}
