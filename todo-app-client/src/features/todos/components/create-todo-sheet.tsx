import { BottomSheet, Button, Column, Text, TextInput } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { createTodo } from "@/lib/api/todos";
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
      snapPoints={["half", "full"]}
    >
      <Column spacing={20} style={{ padding: 24 }}>
        <Text textStyle={{ fontSize: 24, fontWeight: "bold" }}>New Todo</Text>
        <TextInput
          placeholder="What needs doing?"
          onChangeText={setName}
          maxLength={200}
          editable={!create.isPending}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {create.error && <Text>{create.error.message}</Text>}
        <Button
          label={create.isPending ? "Adding…" : "Add Todo"}
          disabled={!name.trim() || create.isPending}
          onPress={submit}
        />
        <Button
          label="Cancel"
          variant="text"
          disabled={create.isPending}
          onPress={onDismiss}
        />
      </Column>
    </BottomSheet>
  );
}
