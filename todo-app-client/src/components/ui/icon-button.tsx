import { SymbolView } from "expo-symbols";
import { useTheme } from "expo-router";
import { Pressable } from "react-native";
export function IconButton({ label, name, onPress, disabled = false, color }: { label: string; name: React.ComponentProps<typeof SymbolView>["name"]; onPress?(): void; disabled?: boolean; color?: string }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: disabled || pressed ? 0.4 : 1 })}><SymbolView name={name} tintColor={color ?? colors.primary} size={24} accessible={false} /></Pressable>;
}
