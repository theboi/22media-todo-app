import { TextInput } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { SheetForm } from "@/components/ui/sheet-form";
import { FormField } from "@/components/ui/form-field";
import { updateTodoDescription } from "@/lib/api/todos";
import { invalidateList } from "@/lib/api/invalidate-list";
import type { Todo } from "@/lib/api/list-detail";
export function EditTodoForm({ todo, onSaved }: { todo: Todo; onSaved(): void }) {
  const [description, setDescription] = useState(todo.description ?? "");
  const attempt = useRef<Parameters<typeof updateTodoDescription>[0] | null>(null);
  const client = useQueryClient();
  const save = useMutation({ mutationFn: updateTodoDescription, networkMode: "always", onSuccess: async value => {
    client.setQueryData(["todo", todo.id], value);
    await invalidateList(client, todo.listId);
  } });
  const submit = () => {
    if (save.isPending) return;
    const value = description.trim() || null;
    if (!attempt.current || attempt.current.description !== value) attempt.current = { id: todo.id, description: value, key: randomUUID() };
    save.mutate(attempt.current, { onSuccess: onSaved });
  };
  return <SheetForm error={save.error?.message} submitLabel={save.isPending ? "Saving…" : "Save Todo"} disabled={save.isPending} pending={save.isPending} onSubmit={submit}>
    <FormField label="Description"><TextInput defaultValue={todo.description ?? ""} placeholder="Optional" textAlign="right" maxLength={5000} onChangeText={setDescription} editable={!save.isPending} /></FormField>
  </SheetForm>;
}
