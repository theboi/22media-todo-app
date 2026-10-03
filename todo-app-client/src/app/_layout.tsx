import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { Stack } from "expo-router/stack";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: true, headerLargeTitleEnabled: true }} />
          <Stack.Screen
            name="list/[id]"
            options={{ title: "List", headerBackTitle: "Lists" }}
          />
        </Stack>
    </ThemeProvider>
  );
}
