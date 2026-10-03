import { Button, Host } from "@expo/ui";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import { Text, View } from "react-native";
export function ListsHeader({ onCreate }: { onCreate(): void }) {
  const colors = useSurfaceColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 24,
        gap: 12,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 32, fontWeight: "700" }}
      >
        Lists
      </Text>
      <Host matchContents>
        <Button label="New List" variant="text" onPress={onCreate} />
      </Host>
    </View>
  );
}
