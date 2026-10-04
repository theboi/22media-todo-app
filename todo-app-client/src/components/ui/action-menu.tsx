import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "expo-router";
import type { ActionMenuProps } from "./action-menu-types";
export function ActionMenu({ children, actions, onAction }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="List actions" onPress={() => setOpen(true)}>{children}</Pressable>
    <Modal transparent visible={open} onRequestClose={() => setOpen(false)}><View style={{ flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 24 }}><View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
      {actions.map(action => <Pressable key={action.id} accessibilityRole="button" disabled={action.disabled} onPress={() => { setOpen(false); onAction(action.id); }} style={({ pressed }) => ({ padding: 16, opacity: pressed || action.disabled ? 0.4 : 1 })}><Text style={{ color: action.destructive ? colors.notification : colors.text }}>{action.title}</Text></Pressable>)}
      <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ padding: 16 }}><Text style={{ color: colors.primary }}>Cancel</Text></Pressable>
    </View></View></Modal>
  </>;
}
