import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Home",
        headerShown: true,
        headerLargeTitleEnabled: true,
        headerTitleStyle: Platform.OS === "web" ? { fontSize: 32, fontWeight: "700" } : undefined,
      }} />
    </Stack>
  );
}
