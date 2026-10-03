import { useQuery } from "@tanstack/react-query";
import { useTheme } from "expo-router";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import {
  ActivityIndicator,
  FlatList,
  View,
  useWindowDimensions,
} from "react-native";
import { ListCard } from "@/features/lists/components/list-card";
import { ListsEmptyState } from "@/features/lists/components/lists-empty-state";
import { ListsErrorState } from "@/features/lists/components/lists-error-state";
import { fetchLists } from "@/lib/api/todo-lists";
import { useState } from "react";
import type { TodoList } from "@/lib/api/lists";
import { CreateListSheet } from "@/features/lists/components/create-list-sheet";
import { ListActionsSheet } from "@/features/lists/components/list-actions-sheet";

export default function ListsScreen() {
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<{
    list: TodoList;
    confirm: boolean;
  } | null>(null);
  const { colors } = useTheme();
  const surface = useSurfaceColors();
  const { width, fontScale } = useWindowDimensions();
  const columns = width < 360 || fontScale > 1.4 ? 1 : 2;
  const cardWidth = (Math.min(width, 720) - 40 - 12 * (columns - 1)) / columns;
  const {
    data: lists = [],
    isPending,
    isFetching,
    error,
    refetch,
    fetchStatus,
  } = useQuery({
    queryKey: ["todo-lists"],
    queryFn: ({ signal }) => fetchLists(signal),
    staleTime: 30_000,
    retry: false,
  });
  const paused = isPending && fetchStatus === "paused";

  return (
    <View style={{ flex: 1, backgroundColor: surface.background }}>
      <FlatList
        key={columns}
        data={lists}
        numColumns={columns}
        keyExtractor={(list) => list.id}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ListCard
              list={item}
              onActions={() => setSelected({ list: item, confirm: false })}
              onDelete={() => setSelected({ list: item, confirm: true })}
            />
          </View>
        )}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 20,
          gap: 12,
          flexGrow: 1,
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}
        ListHeaderComponent={
          error && (
            <ListsErrorState
              message={error.message}
              onRetry={() => void refetch()}
            />
          )
        }
        ListEmptyComponent={
          paused ? (
            <ListsErrorState
              message="You’re offline. Reconnect to load your lists."
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <ActivityIndicator
              accessibilityLabel="Loading lists"
              color={colors.primary}
              style={{ marginTop: 64 }}
            />
          ) : !error ? (
            <ListsEmptyState />
          ) : null
        }
        refreshing={isFetching && !isPending}
        onRefresh={() => void refetch()}
        contentInsetAdjustmentBehavior="automatic"
      />
      {creating && <CreateListSheet onDismiss={() => setCreating(false)} />}
      {selected && (
        <ListActionsSheet
          key={selected.list.id}
          {...selected}
          onDismiss={() => setSelected(null)}
        />
      )}
    </View>
  );
}
