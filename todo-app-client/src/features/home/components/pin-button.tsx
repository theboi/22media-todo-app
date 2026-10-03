import { SymbolView } from "expo-symbols";
import { useTheme } from "expo-router";
import { Pressable } from "react-native";

export function PinButton({ onPress, disabled }: { onPress(): void; disabled: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Pin Lists"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled || pressed ? 0.4 : 1,
      })}
    >
      <SymbolView name={{ ios: "pin", android: "push_pin", web: "push_pin" }} tintColor={colors.primary} size={24} accessible={false} />
    </Pressable>
  );
}
