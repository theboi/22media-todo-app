import { ListItem, Text } from "@expo/ui";
import { useState } from "react";
import { Stack } from "expo-router/stack";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { PlusButton } from "@/components/plus-button";
import { CreateTodoSheet } from "@/features/todos/components/create-todo-sheet";
import { TodoList } from "@/features/todos/components/todo-list";
import { sortTodos } from "@/features/todos/sort-todos";
import { fetchList } from "@/lib/api/todo-lists";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function ListScreen() {
  const [creating, setCreating] = useState(false);
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
      <Stack.Screen options={{ title: list?.name ?? "List", headerRight: () => <PlusButton label="New todo" disabled={!list} onPress={() => setCreating(true)} /> }} />
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
      {creating && <CreateTodoSheet listId={id} onDismiss={() => setCreating(false)} />}
    </View>
  );
}
