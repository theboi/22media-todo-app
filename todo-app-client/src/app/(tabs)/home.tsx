import { Button, Column, ListItem, Text } from "@expo/ui";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { fetchLists } from "@/lib/api/todo-lists";
import { fetchTodos, fetchPinnedLists } from "@/lib/api/todos";
import { outstandingTodos } from "@/lib/api/home-data";
import { TodoList, type TodoListSection } from "@/features/todos/components/todo-list";
import { PinListsSheet } from "@/features/home/components/pin-lists-sheet";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function HomeScreen() {
  const colors = useSurfaceColors();
  const router = useRouter();
  const [pinning, setPinning] = useState(false);
  const todos = useQuery({
    queryKey: ["todos"],
    queryFn: ({ signal }) => fetchTodos(signal),
    retry: false,
  });
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
  const loading = todos.isPending || lists.isPending || pins.isPending;
  const error = todos.error ?? lists.error ?? pins.error;
  const paused =
    todos.fetchStatus === "paused" ||
    lists.fetchStatus === "paused" ||
    pins.fetchStatus === "paused";
  const refresh = async () => {
    await Promise.all([todos.refetch(), lists.refetch(), pins.refetch()]);
  };
  const outstanding = outstandingTodos(todos.data ?? []);
  const sections: TodoListSection[] = [
    {
      id: "outstanding",
      title: "Outstanding",
      todos: outstanding,
      emptyText: "All caught up.",
    },
    ...(pins.data ?? []).flatMap((id) => {
      const list = lists.data?.find((item) => item.id === id);
      if (!list) return [];
      return [{
        id,
        title: list.name,
        todos: outstanding.filter((todo) => todo.listId === id),
        emptyText: "All caught up in this list.",
        onOpen: () => router.push({ pathname: "/lists/[id]", params: { id } }),
      }];
    }),
  ];
  let status: string | undefined;
  if (error) status = `${error.message} Tap to retry.`;
  else if (loading) status = paused ? "You’re offline. Reconnect to load Home." : "Loading Home…";
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TodoList
        sections={todos.data ? sections : []}
        onRefresh={refresh}
        header={
          <>
            <Column spacing={12} style={{ padding: 16 }}>
              <Text textStyle={{ fontSize: 32, fontWeight: "bold" }}>Home</Text>
              <Button
                label="Pin Lists"
                variant="text"
                disabled={!lists.data || !pins.data}
                onPress={() => setPinning(true)}
              />
            </Column>
            {status && <ListItem onPress={error ? () => void refresh() : undefined}><Text>{status}</Text></ListItem>}
          </>
        }
      />
      {pinning && (
        <PinListsSheet
          lists={lists.data ?? []}
          pinned={pins.data ?? []}
          onDismiss={() => setPinning(false)}
        />
      )}
    </View>
  );
}
