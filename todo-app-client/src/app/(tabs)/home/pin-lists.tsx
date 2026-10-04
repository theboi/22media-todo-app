import { Column, Host } from "@expo/ui";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Text, View, Pressable, useWindowDimensions } from "react-native";
import { WideButton } from "@/components/ui/wide-button";
import { fetchPinnedLists, savePinnedLists } from "@/lib/api/todos";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import { useRouter } from "expo-router";
import { fetchLists } from "@/lib/api/todo-lists";
import { ListGrid } from "@/features/lists/components/list-grid";
import { ListCard } from "@/features/lists/components/list-card";
import { selectedPins } from "@/features/lists/pinning";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PinListsScreen() {
  const router = useRouter();
  const lists = useQuery({
    queryKey: ["todo-lists"],
    queryFn: ({ signal }) => fetchLists(signal),
    retry: false,
  });
  const pins = useQuery({
    queryKey: ["pinned-lists"],
    queryFn: ({ signal }) => fetchPinnedLists(signal),
    retry: false,
  });
  const [selection, setSelection] = useState<string[] | null>(null);
  const selected =
    selection ??
    pins.data?.filter((id) => lists.data?.some((list) => list.id === id)) ??
    [];
  const [footerHeight, setFooterHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [width, setWidth] = useState(Math.min(window.width, 720) - 40);
  const colors = useSurfaceColors();
  const attempt = useRef<{ ids: string[]; key: string } | null>(null);
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: savePinnedLists,
    networkMode: "always",
    onSuccess: (value) => {
      client.setQueryData(["pinned-lists"], value);
    },
  });

  if (!lists.data || !pins.data)
    return (
      <View style={{ padding: 24 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void lists.refetch();
            void pins.refetch();
          }}
        >
          <Text>
            {lists.error?.message ?? pins.error?.message ?? "Loading lists…"}
          </Text>
        </Pressable>
      </View>
    );

  const submit = () => {
    if (save.isPending) return;
    const ids = selectedPins(lists.data, pins.data, selected);
    if (
      !attempt.current ||
      JSON.stringify(attempt.current.ids) !== JSON.stringify(ids)
    )
      attempt.current = { ids, key: randomUUID() };
    save.mutate(attempt.current, { onSuccess: () => router.dismiss() });
  };
  // Keep the scroll view full-height for native sheet sizing; overlay the
  // actions and reserve their measured height so the last card stays reachable.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ListGrid
        style={{ backgroundColor: colors.background }}
        bottomInset={footerHeight}
        lists={lists.data}
        renderCard={(list) => (
          <ListCard
            list={list}
            selected={selected.includes(list.id)}
            disabled={save.isPending}
            onSelect={() =>
              setSelection((current) => {
                const ids = current ?? selected;
                return ids.includes(list.id)
                  ? ids.filter((id) => id !== list.id)
                  : [...ids, list.id];
              })
            }
          />
        )}
        empty={
          <Text style={{ color: colors.text }}>
            Create a list first in the Lists tab.
          </Text>
        }
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          alignSelf: "center",
          width: "100%",
          maxWidth: 720,
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(16, insets.bottom),
          backgroundColor: colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
        }}
        onLayout={({ nativeEvent }) => {
          if (nativeEvent.layout.width > 0)
            setWidth(nativeEvent.layout.width - 40);
          setFooterHeight(nativeEvent.layout.height);
        }}
      >
        {save.error && (
          <Text accessibilityRole="alert" style={{ color: colors.text }}>
            {save.error.message}
          </Text>
        )}
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Column spacing={12} style={{ width }}>
            <WideButton
              label={save.isPending ? "Saving…" : "Save Selected Lists"}
              width={width}
              disabled={save.isPending}
              onPress={submit}
            />
            <WideButton
              label="Cancel"
              width={width}
              appearance="glass"
              variant="outlined"
              disabled={save.isPending}
              onPress={() => router.dismiss()}
            />
          </Column>
        </Host>
      </View>
    </View>
  );
}
