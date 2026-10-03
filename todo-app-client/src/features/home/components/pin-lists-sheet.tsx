import {
  BottomSheet,
  Button,
  Checkbox,
  Column,
  ScrollView,
  Text,
} from "@expo/ui";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { savePinnedLists } from "@/lib/api/todos";
import type { TodoList } from "@/lib/api/lists";
import { sheetDismissModifiers } from "@/components/ui/sheet-modifiers";
export function PinListsSheet({
  lists,
  pinned,
  onDismiss,
}: {
  lists: TodoList[];
  pinned: string[];
  onDismiss(): void;
}) {
  const [ids, setIds] = useState(
    pinned.filter((id) => lists.some((list) => list.id === id)),
  );
  const attempt = useRef<{ ids: string[]; key: string } | null>(null);
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: savePinnedLists,
    networkMode: "always",
    onSuccess: (value) => {
      queryClient.setQueryData(["pinned-lists"], value);
      onDismiss();
    },
  });
  const submit = () => {
    if (save.isPending) return;
    if (
      !attempt.current ||
      JSON.stringify(attempt.current.ids) !== JSON.stringify(ids)
    )
      attempt.current = { ids: [...ids], key: randomUUID() };
    save.mutate(attempt.current);
  };
  return (
    <BottomSheet
      isPresented
      onDismiss={() => {
        if (!save.isPending) onDismiss();
      }}
      modifiers={sheetDismissModifiers(save.isPending)}
      shouldDismissOnBackPress={!save.isPending}
      shouldDismissOnClickOutside={!save.isPending}
      snapPoints={["half", "full"]}
    >
      <ScrollView>
        <Column spacing={20} style={{ padding: 24 }}>
          <Text textStyle={{ fontSize: 24, fontWeight: "bold" }}>
            Pin Lists
          </Text>
          <Text>Choose lists to show below Outstanding.</Text>
          {!lists.length && <Text>Create a list first in the Lists tab.</Text>}
          {lists.map((list) => (
            <Checkbox
              key={list.id}
              label={list.name}
              value={ids.includes(list.id)}
              disabled={save.isPending}
              onValueChange={(checked) =>
                setIds((current) =>
                  checked
                    ? [...current, list.id]
                    : current.filter((id) => id !== list.id),
                )
              }
            />
          ))}
          {save.error && <Text>{save.error.message}</Text>}
          <Button
            label={save.isPending ? "Saving…" : "Save Pins"}
            disabled={save.isPending}
            onPress={submit}
          />
          <Button
            label="Cancel"
            variant="text"
            disabled={save.isPending}
            onPress={onDismiss}
          />
        </Column>
      </ScrollView>
    </BottomSheet>
  );
}
