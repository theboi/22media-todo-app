import { Host, Text } from "@expo/ui";
import { useTheme } from "expo-router";
import type { NativeStackScreenProps } from "expo-router/native-stack";
import { View } from "react-native";

import type { OnboardingStackParams } from "@/features/onboarding/types";

export function PlaceholderScreen({
  route,
}: NativeStackScreenProps<OnboardingStackParams, "second" | "third">) {
  const { colors, dark } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Host matchContents colorScheme={dark ? "dark" : "light"}>
        <Text textStyle={{ color: typeof colors.text === "string" ? colors.text : undefined, fontSize: 18 }}>
          {route.name === "second" ? "Screen 2 placeholder" : "Screen 3 placeholder"}
        </Text>
      </Host>
    </View>
  );
}
