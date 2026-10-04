import { ListItem, Text } from "@expo/ui";
import { Stack } from "expo-router/stack";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { PlusButton } from "@/components/plus-button";
import { TodoList } from "@/features/todos/components/todo-list";
import { sortTodos } from "@/features/todos/sort-todos";
import { fetchList } from "@/lib/api/todo-lists";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function ListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useSurfaceColors();
  const { data: list, error, isPending, fetchStatus, refetch } = useQuery({
    queryKey: ["list", id],
    queryFn: ({ signal }) => fetchList(id, signal),
    retry: false,
  });
  let status: string | undefined;
  if (error) status = `${error.message} Tap to retry.`;
  else if (isPending) status = fetchStatus === "paused" ? "You’re offline. Reconnect to load this list." : "Loading list…";
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: list?.name ?? "List", headerRight: () => <PlusButton label="New todo" disabled={!list} onPress={() => router.push({ pathname: "/(tabs)/lists/add-todo", params: { listId: id } })} /> }} />
      <TodoList
        sections={list ? [{ id: list.id, todos: sortTodos(list.todos), emptyText: "No todos yet. Tap + to add one." }] : []}
        onRefresh={async () => { await refetch(); }}
        header={
          <>
            {list && <ListItem supportingText={list.description ?? undefined}><Text>{`${list.todos.filter(todo => !todo.isDone).length} outstanding · ${list.todos.length} todos`}</Text></ListItem>}
            {status && <ListItem onPress={error ? () => void refetch() : undefined}><Text>{status}</Text></ListItem>}
          </>
        }
      />
    </View>
  );
}
