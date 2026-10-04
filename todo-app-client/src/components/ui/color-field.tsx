import { RNHostView } from "@expo/ui";
import { Pressable, Text, View } from "react-native";
import { FormField } from "@/components/ui/form-field";

const COLORS = [
  { label: "Sky blue", value: "#4C9AFF" },
  { label: "Peach", value: "#FF8A65" },
  { label: "Lavender", value: "#B39DFF" },
  { label: "Mint", value: "#45CFA3" },
  { label: "Sunshine", value: "#F7C65E" },
  { label: "Rose", value: "#F781AE" },
];

// Android has no Expo UI color well; offer a selectable color palette.
export function ColorField({ value, onChange, disabled }: { value: string; onChange(value: string): void; disabled: boolean }) {
  return (
    <FormField label="Color">
      <RNHostView matchContents>
        <View style={{ flexDirection: "row", flexWrap: "wrap", width: 144 }}>
          {COLORS.map(item => (
            <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ checked: item.value === value, disabled }} disabled={disabled} onPress={() => onChange(item.value)} style={({ pressed }) => ({ width: 48, height: 48, justifyContent: "center", alignItems: "center", opacity: disabled || pressed ? 0.5 : 1 })}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: item.value, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#111827", fontWeight: "700" }}>{value === item.value ? "✓" : ""}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </RNHostView>
    </FormField>
  );
}
