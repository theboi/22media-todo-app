import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { fetchTodo } from "@/lib/api/todos";
import { EditTodoForm } from "@/features/todos/components/edit-todo-form";
export default function EditTodoScreen() {
  const { todoId } = useLocalSearchParams<{ todoId: string }>();
  const router = useRouter();
  const query = useQuery({ queryKey: ["todo", todoId], queryFn: ({ signal }) => fetchTodo(todoId, signal), enabled: Boolean(todoId), retry: false });
  if (!query.data) return <View style={{ padding: 24 }}><Text onPress={query.error ? () => void query.refetch() : undefined}>{query.error?.message ?? "Loading todo…"}</Text></View>;
  return <><Stack.Screen options={{ title: query.data.name }} /><EditTodoForm key={query.data.id} todo={query.data} onSaved={() => router.dismiss()} /></>;
}
