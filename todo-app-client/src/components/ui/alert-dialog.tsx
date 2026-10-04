import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "expo-router";
export type AlertDialogProps = { title: string; message: string; confirmLabel: string; pending: boolean; error?: string; onConfirm(): void; onCancel(): void };
export function AlertDialog({ title, message, confirmLabel, pending, error, onConfirm, onCancel }: AlertDialogProps) {
  const { colors } = useTheme();
  return <Modal transparent visible animationType="fade" onRequestClose={() => { if (!pending) onCancel(); }}>
    <View style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 24 }}>
      <View accessibilityRole="alert" style={{ backgroundColor: colors.card, padding: 24, borderRadius: 16, gap: 16, maxWidth: 440, width: "100%", alignSelf: "center" }}>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>{title}</Text>
        <Text style={{ color: colors.text }}>{error ?? message}</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 16 }}>
          <Pressable accessibilityRole="button" disabled={pending} onPress={onCancel} style={({ pressed }) => ({ padding: 12, opacity: pressed || pending ? 0.5 : 1 })}><Text style={{ color: colors.primary }}>Cancel</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={pending} onPress={onConfirm} style={({ pressed }) => ({ padding: 12, opacity: pressed || pending ? 0.5 : 1 })}><Text style={{ color: colors.notification }}>{pending ? "Deleting…" : confirmLabel}</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}
