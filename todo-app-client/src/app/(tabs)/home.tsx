import { Button, Host } from "@expo/ui";
import { useTheme } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { OnboardingSheet } from "@/features/onboarding/components/onboarding-sheet";

export default function HomeScreen() {
  const { colors } = useTheme();
  const [isPresented, setIsPresented] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 24
      }}
    >
      <Host matchContents seedColor={colors.primary}>
        <Button label="Open onboarding" onPress={() => setIsPresented(true)} />
      </Host>
      <OnboardingSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
      />
    </View>
  );
}
