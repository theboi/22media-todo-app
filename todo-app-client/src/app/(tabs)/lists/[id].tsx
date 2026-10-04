import { ListItem, Text } from "@expo/ui";
import { Stack } from "expo-router/stack";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingCreateButton } from "@/components/ui/floating-create-button";
import { View } from "react-native";
import { useState } from "react";
import { ListHeaderActions } from "@/features/lists/components/list-header-actions";
import { DeleteListDialog } from "@/features/lists/components/delete-list-dialog";
import { listGradient } from "@/features/lists/list-gradient";
import { TodoList } from "@/features/todos/components/todo-list";
import { sortTodos } from "@/features/todos/sort-todos";
import { fetchList } from "@/lib/api/todo-lists";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function ListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useSurfaceColors();
  const {
    data: list,
    error,
    isPending,
    fetchStatus,
    refetch,
  } = useQuery({
    queryKey: ["list", id],
    queryFn: ({ signal }) => fetchList(id, signal),
    retry: false,
  });
  let status: string | undefined;
  if (error) status = `${error.message} Tap to retry.`;
  else if (isPending)
    status =
      fetchStatus === "paused"
        ? "You’re offline. Reconnect to load this list."
        : "Loading list…";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: list?.name ?? "",
          headerTintColor: list ? "#FFFFFF" : undefined,
          headerShadowVisible: false,
          headerBackground: list ? () => <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: list.color, experimental_backgroundImage: listGradient(list.color) }} /> : undefined,
          headerRight: list ? () => <ListHeaderActions
            owner={list.role === "owner"}
            hasDescription={Boolean(list.description)}
            onShare={() => router.push({ pathname: "/(tabs)/lists/share", params: { listId: id } })}
            onRename={() => router.push({ pathname: "/(tabs)/lists/edit", params: { listId: id } })}
            onDescription={() => router.push({ pathname: "/(tabs)/lists/edit", params: { listId: id, field: "description" } })}
            onDelete={() => setDeleting(true)}
          /> : undefined,
          headerLargeTitleEnabled: true
        }}
      />
      <TodoList
        sections={
          list
            ? [
                {
                  id: list.id,
                  todos: sortTodos(list.todos),
                  emptyText: "No todos yet. Tap + to add one.",
                },
              ]
            : []
        }
        onRefresh={async () => {
          await refetch();
        }}
        header={
          <>
            {list?.description && <ListItem supportingText={list.description}><Text>Description</Text></ListItem>}
            {status && (
              <ListItem onPress={error ? () => void refetch() : undefined}>
                <Text>{status}</Text>
              </ListItem>
            )}
          </>
        }
      />
      {list && <View style={{ position: "absolute", right: 20, bottom: Math.max(16, insets.bottom) }}><FloatingCreateButton onPress={() => router.push({ pathname: "/(tabs)/lists/add-todo", params: { listId: id } })} /></View>}
      {deleting && list && <DeleteListDialog list={list} onDismiss={() => setDeleting(false)} onDeleted={() => router.replace("/(tabs)/lists")} />}
    </View>
  );
}
