import { SymbolView } from "expo-symbols";
import { useTheme } from "expo-router";
import { Pressable } from "react-native";
export function FloatingCreateButton({ onPress }: { onPress(): void }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel="New todo" onPress={onPress} style={({ pressed }) => ({ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}><SymbolView name={{ android: "add", web: "add" }} tintColor="#FFFFFF" size={30} accessible={false} /></Pressable>;
}
