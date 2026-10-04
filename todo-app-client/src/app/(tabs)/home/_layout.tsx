import { Stack } from "expo-router";
import { View } from "react-native";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "",
          headerBackground: () => <View></View>,
        }}
      />
      <Stack.Screen
        name="pin-lists"
        options={{
          title: "Pinned Lists",
          presentation: "pageSheet",
        }}
      />
    </Stack>
  );
}
