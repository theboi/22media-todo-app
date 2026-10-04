import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "expo-router";
import type { ActionMenuProps } from "./action-menu-types";
export function ActionMenu({ children, actions, onAction, longPress, onPress, label = "List actions" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={longPress ? onPress : () => setOpen(true)} onLongPress={longPress ? () => setOpen(true) : undefined}>{children}</Pressable>
    <Modal transparent visible={open} onRequestClose={() => setOpen(false)}><View style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 24 }}><View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
      {actions.map(action => <Pressable key={action.id} accessibilityRole="button" disabled={action.disabled} onPress={() => { setOpen(false); onAction(action.id); }} style={({ pressed }) => ({ padding: 16, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed || action.disabled ? 0.4 : 1 })}>{action.icon && <SymbolView name={action.icon} size={20} tintColor={action.destructive ? colors.notification : colors.text} />}<Text style={{ color: action.destructive ? colors.notification : colors.text }}>{action.title}</Text></Pressable>)}
      <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ padding: 16 }}><Text style={{ color: colors.primary }}>Cancel</Text></Pressable>
    </View></View></Modal>
  </>;
}
