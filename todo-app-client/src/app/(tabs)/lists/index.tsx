import { PendingShares } from "@/features/lists/components/pending-shares";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router/stack";
import { PlusButton } from "@/components/ui/plus-button";
import { useRouter, useTheme } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { ListGrid } from "@/features/lists/components/list-grid";
import { ListCard } from "@/features/lists/components/list-card";
import { ListsEmptyState } from "@/features/lists/components/lists-empty-state";
import { ListsErrorState } from "@/features/lists/components/lists-error-state";
import { fetchLists } from "@/lib/api/todo-lists";
import { useState } from "react";
import type { TodoList } from "@/lib/api/lists";
import { ListActionsSheet } from "@/features/lists/components/list-actions-sheet";

export default function ListsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<{
    list: TodoList;
    confirm: boolean;
  } | null>(null);
  const { colors } = useTheme();
  const { data: lists = [], ...query } = useQuery({
    queryKey: ["todo-lists"],
    queryFn: ({ signal }) => fetchLists(signal),
    staleTime: 30_000,
    retry: false,
  });
  const paused = query.isPending && query.fetchStatus === "paused";

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <PlusButton label="New list" onPress={() => router.push('/(tabs)/lists/add-new')} />
          ),
        }}
      />
      <ListGrid
        lists={lists}
        renderCard={(list) => (
          <ListCard
            list={list}
            onActions={() => setSelected({ list, confirm: false })}
            onDelete={() => setSelected({ list, confirm: true })}
            onRename={() => router.push({ pathname: "/(tabs)/lists/edit-list", params: { listId: list.id } })}
            onShare={() => router.push({ pathname: "/(tabs)/lists/share", params: { listId: list.id } })}
          />
        )}
        header={
          <>
            <PendingShares onVerify={() => router.push("/(tabs)/lists/verify-email")} />
            {query.error ? <ListsErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : null}
          </>
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
      {selected && (
        <ListActionsSheet
          key={selected.list.id}
          {...selected}
          onDismiss={() => setSelected(null)}
          onEdit={() => { const id = selected.list.id; setSelected(null); router.push({ pathname: "/(tabs)/lists/edit-list", params: { listId: id } }); }}
          onShare={() => { const id = selected.list.id; setSelected(null); router.push({ pathname: "/(tabs)/lists/share", params: { listId: id } }); }}
        />
      )}
    </View>
  );
}
