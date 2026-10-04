import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { EditListForm } from "@/features/lists/components/edit-list-form";
import { fetchList } from "@/lib/api/todo-lists";

export default function EditListScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const query = useQuery({ queryKey: ["list", listId], queryFn: ({ signal }) => fetchList(listId, signal), enabled: Boolean(listId), retry: false });
  if (!query.data) return <View style={{ padding: 24 }}><Text onPress={query.error ? () => void query.refetch() : undefined}>{query.error?.message ?? "Loading list…"}</Text></View>;
  return <EditListForm key={query.data.id} list={query.data} onSaved={() => router.dismiss()} />;
}
