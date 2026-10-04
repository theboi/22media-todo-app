import { TextInput } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { SheetForm } from "@/components/ui/sheet-form";
import { FormField } from "@/components/ui/form-field";
import { updateList } from "@/lib/api/todo-lists";
import { invalidateList } from "@/lib/api/invalidate-list";
import type { TodoList } from "@/lib/api/lists";

export function EditListForm({ list, field = "name", onSaved }: { list: TodoList; field?: "name" | "description"; onSaved(): void }) {
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? "");
  const attempt = useRef<Parameters<typeof updateList>[0] | null>(null);
  const queryClient = useQueryClient();
  const save = useMutation({ mutationFn: updateList, networkMode: "always", onSuccess: async () => { await invalidateList(queryClient, list.id); } });
  const submit = () => {
    if (save.isPending || (field === "name" && !name.trim())) return;
    const desc = description.trim() || null;
    if (!attempt.current || (field === "name" ? attempt.current.name !== name.trim() : attempt.current.description !== desc)) attempt.current = { id: list.id, ...(field === "name" ? { name: name.trim() } : { description: desc }), key: randomUUID() };
    save.mutate(attempt.current, { onSuccess: onSaved });
  };
  return <SheetForm error={save.error?.message} submitLabel={save.isPending ? "Saving…" : "Save List"} disabled={save.isPending || (field === "name" && !name.trim()) || list.role !== "owner"} pending={save.isPending} onSubmit={submit}>
    {field === "name" ? <FormField label="Name"><TextInput defaultValue={list.name} textAlign="right" maxLength={120} onChangeText={setName} editable={!save.isPending} /></FormField> : <FormField label="Description"><TextInput defaultValue={list.description ?? ""} textAlign="right" placeholder="Optional" maxLength={2000} onChangeText={setDescription} editable={!save.isPending} /></FormField>}
  </SheetForm>;
}
