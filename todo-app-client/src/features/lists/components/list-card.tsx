import { useState } from "react";
import { SymbolView } from "expo-symbols";
import { Link } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { ListIcon } from "./list-icon";
import type { TodoList } from "@/lib/api/lists";

export function ListCard({
  list,
  onActions,
  onDelete,
  onSelect,
  selected,
  disabled,
}: { list: TodoList } & (
  | { onActions(): void; onDelete(): void; onSelect?: never; selected?: never; disabled?: never }
  | { onSelect(): void; selected: boolean; disabled: boolean; onActions?: never; onDelete?: never }
)) {
  const [pressed, setPressed] = useState(false);
  const rgb = list.color.slice(1).match(/.{2}/g) ?? [];
  const [r = 0, g = 0, b = 0] = rgb.map((hex) => {
    const c = parseInt(hex, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const textColor =
    0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#111827" : "#FFFFFF";
  const content = (
    <Pressable
      accessibilityRole={onSelect ? "checkbox" : "button"}
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      disabled={disabled}
      onPress={onSelect}
      accessibilityLabel={onSelect ? list.name : `${list.name}, ${list.role === "owner" ? "Your list" : "Shared with you"}`}
      accessibilityHint={onSelect ? "Select this list to pin on Home" : "Opens this list. Long press for actions."}
      onLongPress={onSelect || Platform.OS === "ios" ? undefined : onActions}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        minHeight: 164,
        padding: 16,
        gap: 22,
        borderRadius: 20,
        borderCurve: "continuous",
        backgroundColor: list.color,
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }}
    >
      {selected && (
        <View style={{ position: "absolute", top: 16, right: 16 }}>
          <SymbolView name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }} tintColor="#FFFFFF" size={26} accessible={false} />
        </View>
      )}
      <ListIcon name={list.icon} color="#FFFFFF" size={32} />
      <View style={{ gap: 6 }}>
        <Text style={{ color: textColor, fontSize: 19, fontWeight: "700" }}>
          {list.name}
        </Text>
        <Text style={{ color: textColor, fontSize: 13 }}>
          {list.role === "owner" ? "Your list" : "Shared with you"}
        </Text>
      </View>
    </Pressable>
  );
  if (onSelect) return content;
  const href = { pathname: "/lists/[id]", params: { id: list.id } } as const;
  if (Platform.OS !== "ios")
    return (
      <Link href={href} asChild>
        {content}
      </Link>
    );
  return (
    <Link href={href} asChild>
      <Link.Trigger>{content}</Link.Trigger>
      <Link.Menu>
        <Link.MenuAction title="Share" icon="square.and.arrow.up" disabled />
        <Link.MenuAction
          title="Delete"
          icon="trash"
          destructive
          disabled={list.role !== "owner"}
          onPress={onDelete}
        />
      </Link.Menu>
    </Link>
  );
}
