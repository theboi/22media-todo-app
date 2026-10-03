import { BottomSheet, Button, Column, Text } from "@expo/ui";
import { sheetDismissModifiers } from "@/components/ui/sheet-modifiers";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteList } from "@/lib/api/todo-lists";
import type { TodoList } from "@/lib/api/lists";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export function ListActionsSheet({
  list,
  confirm,
  onDismiss,
}: {
  list: TodoList;
  confirm: boolean;
  onDismiss(): void;
}) {
  const [confirming, setConfirming] = useState(confirm);
  const [key] = useState(randomUUID);
  const colors = useSurfaceColors();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => deleteList({ id: list.id, key }),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["list", list.id] });
      queryClient.removeQueries({ queryKey: ["list", list.id] });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["todo-lists"] }),
        queryClient.invalidateQueries({ queryKey: ["todos"] }),
        queryClient.invalidateQueries({ queryKey: ["pinned-lists"] }),
      ]);
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      onDismiss();
    },
  });
  return (
    <BottomSheet
      isPresented
      onDismiss={() => {
        if (!remove.isPending) onDismiss();
      }}
      shouldDismissOnBackPress={!remove.isPending}
      shouldDismissOnClickOutside={!remove.isPending}
      modifiers={sheetDismissModifiers(remove.isPending)}
      containerColor={colors.background}
    >
      <Column spacing={20} style={{ padding: 24 }}>
        <Text textStyle={{ fontSize: 22, fontWeight: "bold" }}>
          {confirming ? `Delete “${list.name}”?` : list.name}
        </Text>
        {confirming ? (
          <Text>This permanently deletes the list and all its todos.</Text>
        ) : (
          <Button label="Share" disabled />
        )}
        {remove.error && <Text>{remove.error.message}</Text>}
        <Button
          label={remove.isPending ? "Deleting…" : "Delete"}
          disabled={remove.isPending || list.role !== "owner"}
          onPress={() => {
            if (confirming) remove.mutate();
            else setConfirming(true);
          }}
        />
        <Button
          label="Cancel"
          variant="text"
          disabled={remove.isPending}
          onPress={onDismiss}
        />
      </Column>
    </BottomSheet>
  );
}
