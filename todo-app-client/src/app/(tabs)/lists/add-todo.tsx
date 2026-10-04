import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { CreateTodoSheet } from "@/features/todos/components/create-todo-sheet";

export default function AddTodoScreen() {
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const router = useRouter();
  if (!listId) return <View><Text>Open a list to add a todo.</Text></View>;
  return <CreateTodoSheet listId={listId} onDismiss={() => router.dismiss()} />;
}
