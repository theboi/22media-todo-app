import { Column, Host } from "@expo/ui";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { WideButton } from "@/components/ui/wide-button";
import { savePinnedLists } from "@/lib/api/todos";
import type { TodoList } from "@/lib/api/lists";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import { selectedPins } from "../pinning";
import { ListGrid } from "./list-grid";
import { ListCard } from "./list-card";

export function PinListsSheet({ lists, pinned, onDismiss }: { lists: TodoList[]; pinned: string[]; onDismiss(): void }) {
  const [selected, setSelected] = useState(() => pinned.filter(id => lists.some(list => list.id === id)));
  const window = useWindowDimensions();
  const [width, setWidth] = useState(window.width);
  const colors = useSurfaceColors();
  const attempt = useRef<{ ids: string[]; key: string } | null>(null);
  const client = useQueryClient();
  const save = useMutation({ mutationFn: savePinnedLists, networkMode: "always", onSuccess: value => { client.setQueryData(["pinned-lists"], value); onDismiss(); } });
  const submit = () => {
    if (save.isPending) return;
    const ids = selectedPins(lists, pinned, selected);
    if (!attempt.current || JSON.stringify(attempt.current.ids) !== JSON.stringify(ids)) attempt.current = { ids, key: randomUUID() };
    save.mutate(attempt.current);
  };
  return <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <ListGrid lists={lists} renderCard={list => <ListCard list={list} selected={selected.includes(list.id)} disabled={save.isPending} onSelect={() => setSelected(current => current.includes(list.id) ? current.filter(id => id !== list.id) : [...current, list.id])} />} empty={<Text style={{ color: colors.text }}>Create a list first in the Lists tab.</Text>} />
    <View style={{ padding: 16, gap: 12 }}>
      {save.error && <Text accessibilityRole="alert" style={{ color: colors.text }}>{save.error.message}</Text>}
      <Host matchContents><Column spacing={12}>
        <WideButton label={save.isPending ? "Saving…" : "Save Selected Lists"} width={width - 32} disabled={save.isPending} onPress={submit} />
        <WideButton label="Cancel" width={width - 32} appearance="glass" variant="outlined" disabled={save.isPending} onPress={onDismiss} />
      </Column></Host>
    </View>
  </View>;
}
