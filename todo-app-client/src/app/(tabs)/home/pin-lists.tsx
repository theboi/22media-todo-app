import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";
import { fetchLists } from "@/lib/api/todo-lists";
import { fetchPinnedLists } from "@/lib/api/todos";
import { PinListsSheet } from "@/features/lists/components/pin-lists-sheet";

export default function PinListsScreen() {
  const router = useRouter();
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
  if (!lists.data || !pins.data)
    return (
      <View style={{ padding: 24 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void lists.refetch();
            void pins.refetch();
          }}
        >
          <Text>
            {lists.error?.message ?? pins.error?.message ?? "Loading lists…"}
          </Text>
        </Pressable>
      </View>
    );
  return (
    <PinListsSheet
      lists={lists.data}
      pinned={pins.data}
      onDismiss={() => router.dismiss()}
    />
  );
}
