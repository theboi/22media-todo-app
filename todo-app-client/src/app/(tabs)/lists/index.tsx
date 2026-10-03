import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router/stack";
import { PlusButton } from "@/components/plus-button";
import { useTheme } from "expo-router";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import {
  ActivityIndicator,
  View,
} from "react-native";
import { ListGrid } from "@/features/lists/components/list-grid";
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
  const {
    data: lists = [],
    ...query
  } = useQuery({
    queryKey: ["todo-lists"],
    queryFn: ({ signal }) => fetchLists(signal),
    staleTime: 30_000,
    retry: false,
  });
  const paused = query.isPending && query.fetchStatus === "paused";

  return (
    <View style={{ flex: 1, backgroundColor: surface.background }}>
      <Stack.Screen options={{ headerRight: () => <PlusButton label="New list" onPress={() => setCreating(true)} /> }} />
      <ListGrid
        lists={lists}
        renderCard={(list) => (
          <ListCard
            list={list}
            onActions={() => setSelected({ list, confirm: false })}
            onDelete={() => setSelected({ list, confirm: true })}
          />
        )}
        header={
          query.error ? (
            <ListsErrorState
              message={query.error.message}
              onRetry={() => void query.refetch()}
            />
          ) : null
        }
        empty={
          paused ? (
            <ListsErrorState
              message="You’re offline. Reconnect to load your lists."
              onRetry={() => void query.refetch()}
            />
          ) : query.isPending ? (
            <ActivityIndicator
              accessibilityLabel="Loading lists"
              color={colors.primary}
              style={{ marginTop: 64 }}
            />
          ) : !query.error ? (
            <ListsEmptyState />
          ) : null
        }
        refreshing={query.isFetching && !query.isPending}
        onRefresh={() => void query.refetch()}
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
