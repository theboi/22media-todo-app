import { Button, Host } from "@expo/ui";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import { Text, View } from "react-native";
export function ListsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry(): void;
}) {
  const colors = useSurfaceColors();
  return (
    <View
      style={{
        padding: 20,
        gap: 14,
        borderRadius: 16,
        backgroundColor: colors.card,
        marginBottom: 20,
      }}
    >
      <Text selectable accessibilityRole="alert" style={{ color: colors.text }}>
        {message}
      </Text>
      <Host matchContents>
        <Button label="Try again" onPress={onRetry} />
      </Host>
    </View>
  );
}
