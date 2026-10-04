import { Host, RNHostView } from "@expo/ui";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useTheme } from "expo-router";
export function SwipeDelete({ children, onDelete, disabled }: { children: React.ReactNode; onDelete(): void; disabled: boolean }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  return <RNHostView matchContents><View style={{ width: width - 32 }}>
    <Swipeable overshootRight={false} renderRightActions={() => <Pressable accessibilityRole="button" accessibilityLabel="Delete Todo" disabled={disabled} onPress={onDelete} style={({ pressed }) => ({ width: 80, backgroundColor: colors.notification, alignItems: "center", justifyContent: "center", opacity: disabled || pressed ? 0.5 : 1 })}><Text style={{ color: "#FFFFFF" }}>Delete</Text></Pressable>}>
      <Host matchContents>{children}</Host>
    </Swipeable>
  </View></RNHostView>;
}
