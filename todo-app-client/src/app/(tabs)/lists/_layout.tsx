import { Stack } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Lists",
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Screen
        name="add-new"
        options={{
          title: "New List",
          presentation: "formSheet",
          sheetAllowedDetents: [0.6, 1],
        }}
      />
      <Stack.Screen
        name="add-todo"
        options={{ title: "New Todo", presentation: "formSheet", sheetAllowedDetents: [0.4, 1], sheetGrabberVisible: true }}
      />
      <Stack.Screen name="edit" options={{ title: "Edit List", presentation: "formSheet", sheetAllowedDetents: [0.5, 1] }} />
      <Stack.Screen name="share" options={{ title: "Share List", presentation: "formSheet", sheetAllowedDetents: [0.5, 1] }} />
      <Stack.Screen name="verify-email" options={{ title: "Verify Email", presentation: "formSheet", sheetAllowedDetents: [0.5, 1] }} />
    </Stack>
  );
}
