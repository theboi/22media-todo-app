import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { Stack } from "expo-router/stack";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="edit-todo" options={{ title: "Edit Todo", presentation: "formSheet", sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="pin-lists" options={{ title: "Pin Lists", presentation: "formSheet", sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="sign-in" options={{ title: "Sign In", presentation: "formSheet", sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="sign-up" options={{ title: "Sign Up", presentation: "formSheet", sheetAllowedDetents: [0.5, 1], sheetGrabberVisible: true }} />
        </Stack>
      </QueryClientProvider>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
