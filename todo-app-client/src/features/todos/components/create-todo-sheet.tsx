import { BottomSheet, FieldGroup, TextInput } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { createTodo } from "@/lib/api/todos";
import { SheetForm } from "@/components/ui/sheet-form";
import { sheetDismissModifiers } from "@/components/ui/sheet-modifiers";
export function CreateTodoSheet({
  listId,
  onDismiss,
}: {
  listId: string;
  onDismiss(): void;
}) {
  const [name, setName] = useState("");
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
    if (!attempt.current || attempt.current.name !== name.trim())
      attempt.current = {
        id: randomUUID(),
        key: randomUUID(),
        listId,
        name: name.trim(),
      };
    create.mutate(attempt.current);
  };
  return (
    <BottomSheet
      isPresented
      onDismiss={() => {
        if (!create.isPending) onDismiss();
      }}
      modifiers={sheetDismissModifiers(create.isPending)}
      shouldDismissOnBackPress={!create.isPending}
      shouldDismissOnClickOutside={!create.isPending}
      snapPoints={["full"]}
    >
      <SheetForm
        title="New Todo"
        error={create.error?.message}
        submitLabel={create.isPending ? "Adding…" : "Add Todo"}
        disabled={!name.trim() || create.isPending}
        pending={create.isPending}
        onSubmit={submit}
        onCancel={onDismiss}
      >
        <FieldGroup.Section title="Todo name">
          <TextInput
            placeholder="What needs doing?"
            onChangeText={setName}
            maxLength={200}
            editable={!create.isPending}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </FieldGroup.Section>
      </SheetForm>
    </BottomSheet>
  );
}
