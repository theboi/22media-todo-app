import { Button, Column, Host, Text } from "@expo/ui";
import { useTheme } from "expo-router";
import type { NativeStackScreenProps } from "expo-router/native-stack";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { OnboardingStackParams } from "@/features/onboarding/types";

export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<OnboardingStackParams, "welcome">) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 100,
        paddingBottom: Math.max(insets.bottom, 24),
        gap: 24,
      }}
    >
      <Host
        matchContents={{ vertical: true }}
        colorScheme={dark ? "dark" : "light"}
        style={{ alignSelf: "stretch" }}
      >
        <Column spacing={16} alignment="center" style={{ width: "100%" }}>
          <Text
            style={{ width: "100%" }}
            textStyle={{
              color: typeof colors.text === "string" ? colors.text : undefined,
              fontSize: 40,
              fontWeight: "700",
              lineHeight: 46,
              textAlign: "center",
            }}
          >
            Todo reimagined.
          </Text>
          <Text
            style={{ width: "100%" }}
            textStyle={{ color: typeof colors.text === "string" ? colors.text : undefined, fontSize: 18, lineHeight: 26, textAlign: "center" }}
          >
            Eves listens to your conversations and drops Todos in your Lists.
          </Text>
        </Column>
      </Host>
      <View
        testID="onboarding-gif-space"
        accessible={false}
        style={{ flex: 1, minHeight: 220 }}
      />
      <Host
        matchContents={{ vertical: true }}
        colorScheme={dark ? "dark" : "light"}
        seedColor={colors.primary}
        style={{ alignSelf: "stretch" }}
      >
        <Button
          variant="filled"
          style={{ width: "100%" }}
          onPress={() => navigation.push("second")}
        >
          <Text
            style={{ width: "100%", paddingVertical: 14 }}
            textStyle={{ fontSize: 18, fontWeight: "600", textAlign: "center", color: "#FFFFFF" }}
          >
            Get Started
          </Text>
        </Button>
      </Host>
    </ScrollView>
  );
}
