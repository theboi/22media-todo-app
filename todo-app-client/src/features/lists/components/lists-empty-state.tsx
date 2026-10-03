import { ListIcon } from "./list-icon";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import { Text, View } from "react-native";
export function ListsEmptyState() {
  const colors = useSurfaceColors();
  return (
    <View style={{ paddingVertical: 64, alignItems: "center", gap: 12 }}>
      <ListIcon name="droplet" size={48} color={colors.secondaryText} />
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 20, fontWeight: "600" }}
      >
        Room for a fresh start.
      </Text>
      <Text
        style={{
          color: colors.secondaryText,
          fontSize: 15,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        Your lists will appear here once you create them.
      </Text>
    </View>
  );
}
