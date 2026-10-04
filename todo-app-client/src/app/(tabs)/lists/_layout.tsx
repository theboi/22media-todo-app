import { Stack } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Lists",
          headerShown: true,
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "List", headerBackTitle: "Lists" }}
      />
      <Stack.Screen
        name="add-new"
        options={{
          title: "Add New",
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
        }}
      />
      <Stack.Screen
        name="add-todo"
        options={{ title: "New Todo", presentation: "formSheet", sheetAllowedDetents: [0.5], sheetGrabberVisible: true }}
      />
    </Stack>
  );
}
