import { BottomSheet, RNHostView } from "@expo/ui";
import { useTheme } from "expo-router";
import { createNativeStackNavigator } from "expo-router/native-stack";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "expo-router/react-navigation";
import { View, useWindowDimensions } from "react-native";

import { PlaceholderScreen } from "@/features/onboarding/components/placeholder-screen";
import { WelcomeScreen } from "@/features/onboarding/components/welcome-screen";

const Stack = createNativeStackNavigator<{
  welcome: undefined;
  second: undefined;
  third: undefined;
}>();

export function OnboardingSheet({
  isPresented,
  onDismiss,
}: {
  isPresented: boolean;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={["full"]}
      contentPadding={0}
      containerColor={theme.colors.background}
      showDragIndicator={false}
    >
      <RNHostView matchContents>
        <View style={{ height: height * 0.85, width }}>
          {isPresented && (
            <NavigationIndependentTree>
              <NavigationContainer
                theme={theme}
                documentTitle={{ enabled: false }}
              >
                <Stack.Navigator
                  initialRouteName="welcome"
                  screenOptions={{
                    contentStyle: { backgroundColor: theme.colors.background },
                    headerShadowVisible: false,
                    headerBackButtonDisplayMode: "minimal",
                  }}
                >
                  <Stack.Screen
                    name="welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="second"
                    component={PlaceholderScreen}
                    options={{ title: "" }}
                  />
                  <Stack.Screen
                    name="third"
                    component={PlaceholderScreen}
                    options={{ title: "" }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </NavigationIndependentTree>
          )}
        </View>
      </RNHostView>
    </BottomSheet>
  );
}
