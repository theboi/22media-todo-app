import { Stack } from "expo-router/stack";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { EditListForm } from "@/features/lists/components/edit-list-form";
import { fetchList } from "@/lib/api/todo-lists";

export default function EditListScreen() {
  const { listId, field } = useLocalSearchParams<{ listId: string; field?: string }>();
  const router = useRouter();
  const query = useQuery({ queryKey: ["list", listId], queryFn: ({ signal }) => fetchList(listId, signal), enabled: Boolean(listId), retry: false });
  if (!query.data) return <View style={{ padding: 24 }}><Text onPress={query.error ? () => void query.refetch() : undefined}>{query.error?.message ?? "Loading list…"}</Text></View>;
  return <><Stack.Screen options={{ title: field === "description" ? "List Description" : "Rename List" }} /><EditListForm key={`${query.data.id}-${field}`} list={query.data} field={field === "description" ? "description" : "name"} onSaved={() => router.dismiss()} /></>;
}
