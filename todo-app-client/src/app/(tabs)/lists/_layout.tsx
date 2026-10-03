import { Stack } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Lists", headerShown: true, headerLargeTitleEnabled: true }} />
      <Stack.Screen
        name="[id]"
        options={{ title: "List", headerBackTitle: "Lists" }}
      />
    </Stack>
  );
}
