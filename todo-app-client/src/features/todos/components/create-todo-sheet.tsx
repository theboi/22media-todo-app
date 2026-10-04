import { DeadlineField } from "@/components/ui/deadline-field";
import { TextInput } from "@expo/ui";
import { FormField } from "@/components/ui/form-field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { createTodo } from "@/lib/api/todos";
import { SheetForm } from "@/components/ui/sheet-form";
export function CreateTodoSheet({
  listId,
  onDismiss,
}: {
  listId: string;
  onDismiss(): void;
}) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const attempt = useRef<Parameters<typeof createTodo>[0] | null>(null);
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createTodo,
    networkMode: "always",
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", listId] }),
        queryClient.invalidateQueries({ queryKey: ["todos"] }),
      ]);
      onDismiss();
    },
  });
  const submit = () => {
    if (!name.trim() || create.isPending) return;
    if (!attempt.current || attempt.current.name !== name.trim() || attempt.current.deadline !== (deadline?.toISOString() ?? null))
      attempt.current = {
        id: randomUUID(),
        key: randomUUID(),
        listId,
        name: name.trim(),
        deadline: deadline?.toISOString() ?? null,
      };
    create.mutate(attempt.current);
  };
  return (
    <SheetForm
      error={create.error?.message}
      submitLabel={create.isPending ? "Adding…" : "Add Todo"}
      disabled={!name.trim() || create.isPending}
      pending={create.isPending}
      onSubmit={submit}
      fieldCount={deadline ? 3 : 2}
    >
      <FormField label="Name">
        <TextInput
          textAlign="right"
          placeholder="What needs doing?"
          onChangeText={setName}
          maxLength={200}
          editable={!create.isPending}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </FormField>
      <DeadlineField value={deadline} onChange={setDeadline} disabled={create.isPending} />
    </SheetForm>
  );
}
