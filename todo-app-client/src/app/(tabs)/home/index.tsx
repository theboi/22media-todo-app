import { ListItem, Text } from "@expo/ui";
import { Stack } from "expo-router/stack";
import { PinButton } from "@/features/home/components/pin-button";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { fetchLists } from "@/lib/api/todo-lists";
import { fetchTodos, fetchPinnedLists } from "@/lib/api/todos";
import { outstandingTodos } from "@/lib/api/home-data";
import { TodoList, type TodoListSection } from "@/features/todos/components/todo-list";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function HomeScreen() {
  const colors = useSurfaceColors();
  const router = useRouter();
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
      <Stack.Screen options={{ headerRight: () => <PinButton disabled={!lists.data || !pins.data} onPress={() => router.push("/pin-lists")} /> }} />
      <TodoList
        sections={todos.data ? sections : []}
        onRefresh={refresh}
        header={
          <>

            {status && <ListItem onPress={error ? () => void refresh() : undefined}><Text>{status}</Text></ListItem>}
          </>
        }
      />
    </View>
  );
}
