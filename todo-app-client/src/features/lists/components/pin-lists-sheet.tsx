import { BottomSheet, Button, Column, Host, RNHostView } from "@expo/ui";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { savePinnedLists } from "@/lib/api/todos";
import type { TodoList } from "@/lib/api/lists";
import { sheetDismissModifiers } from "@/components/ui/sheet-modifiers";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import { appendPins, unpinnedLists } from "../pinning";
import { ListGrid } from "./list-grid";
import { ListCard } from "./list-card";

export function PinListsSheet({ lists, pinned, onDismiss }: {
  lists: TodoList[];
  pinned: string[];
  onDismiss(): void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const { height } = useWindowDimensions();
  const colors = useSurfaceColors();
  const available = unpinnedLists(lists, pinned);
  const selectedAvailable = selected.filter((id) => available.some((list) => list.id === id));
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
    if (save.isPending || !selectedAvailable.length) return;
    const ids = appendPins(lists, pinned, selectedAvailable);
    if (!attempt.current || JSON.stringify(attempt.current.ids) !== JSON.stringify(ids)) {
      attempt.current = { ids, key: randomUUID() };
    }
    save.mutate(attempt.current);
  };
  return (
    <BottomSheet
      isPresented
      onDismiss={() => { if (!save.isPending) onDismiss(); }}
      modifiers={sheetDismissModifiers(save.isPending)}
      shouldDismissOnBackPress={!save.isPending}
      shouldDismissOnClickOutside={!save.isPending}
      snapPoints={["full"]}
      contentPadding={0}
      containerColor={colors.background}
    >
      <Column style={{ height: height * 0.8 }}>
        <RNHostView>
          <View style={{ flex: 1 }}>
            <View style={{ padding: 20, gap: 8 }}>
              <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: "700" }}>Pin Lists</Text>
              <Text style={{ color: colors.secondaryText }}>Choose lists to add below Outstanding.</Text>
            </View>
            <ListGrid
              lists={available}
              renderCard={(list) => (
                <ListCard
                  list={list}
                  selected={selected.includes(list.id)}
                  disabled={save.isPending}
                  onSelect={() => setSelected((current) => current.includes(list.id) ? current.filter((id) => id !== list.id) : [...current, list.id])}
                />
              )}
              empty={<Text style={{ color: colors.secondaryText }}>{lists.length ? "All your lists are already pinned." : "Create a list first in the Lists tab."}</Text>}
            />
            <View style={{ padding: 20, gap: 12 }}>
              {save.error && <Text accessibilityRole="alert" style={{ color: colors.text }}>{save.error.message}</Text>}
              <Host matchContents>
                <Column spacing={12}>
                  <Button label={save.isPending ? "Pinning…" : "Pin Selected Lists"} disabled={save.isPending || !selectedAvailable.length} onPress={submit} />
                  <Button label="Cancel" variant="text" disabled={save.isPending} onPress={onDismiss} />
                </Column>
              </Host>
            </View>
          </View>
        </RNHostView>
      </Column>
    </BottomSheet>
  );
}
