import { SymbolView } from "expo-symbols";
import { useTheme } from "expo-router";
import { Pressable } from "react-native";

export function PlusButton({ label, onPress, disabled = false }: {
  label: string;
  onPress(): void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}
    >
      <SymbolView name={{ ios: "plus", android: "add", web: "add" }} tintColor={colors.primary} size={24} />
    </Pressable>
  );
}
