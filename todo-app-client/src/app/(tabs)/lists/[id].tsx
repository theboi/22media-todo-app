import { Stack } from "expo-router/stack";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { fetchList } from "@/lib/api/todo-lists";
import { TodoRow } from "@/features/lists/components/todo-row";
import { ListsErrorState } from "@/features/lists/components/lists-error-state";
import { ListIcon } from "@/features/lists/components/list-icon";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useSurfaceColors();
  const {
    data: list,
    error,
    isPending,
    isFetching,
    fetchStatus,
    refetch,
  } = useQuery({
    queryKey: ["list", id],
    queryFn: ({ signal }) => fetchList(id, signal),
    retry: false,
  });
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: list?.name ?? "List" }} />
      <FlatList
        data={list?.todos ?? []}
        keyExtractor={(todo) => todo.id}
        renderItem={({ item }) => <TodoRow todo={item} />}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
        refreshing={isFetching && !isPending}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          <>
            {list && (
              <View
                style={{
                  padding: 20,
                  borderRadius: 20,
                  backgroundColor: list.color,
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <ListIcon name={list.icon} color="#FFFFFF" size={36} />
                {list.description && (
                  <Text style={{ color: "#111827" }}>{list.description}</Text>
                )}
                <Text style={{ color: "#111827" }}>
                  {list.todos.filter((todo) => !todo.isDone).length} outstanding
                  · {list.todos.length} todos
                </Text>
              </View>
            )}
            {error && (
              <ListsErrorState
                message={error.message}
                onRetry={() => void refetch()}
              />
            )}
          </>
        }
        ListEmptyComponent={
          isPending ? (
            fetchStatus === "paused" ? (
              <ListsErrorState
                message="You’re offline. Reconnect to load this list."
                onRetry={() => void refetch()}
              />
            ) : (
              <ActivityIndicator
                accessibilityLabel="Loading list"
                style={{ marginTop: 64 }}
              />
            )
          ) : !error ? (
            <Text
              style={{
                color: colors.secondaryText,
                textAlign: "center",
                padding: 40,
              }}
            >
              No todos yet.
            </Text>
          ) : null
        }
      />
    </View>
  );
}
