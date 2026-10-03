import { useState } from "react";
import { Link } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { ListIcon } from "./list-icon";
import type { TodoList } from "@/lib/api/lists";

export function ListCard({
  list,
  onActions,
  onDelete,
}: {
  list: TodoList;
  onActions(): void;
  onDelete(): void;
}) {
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
      accessibilityRole="button"
      accessibilityLabel={`${list.name}, ${list.role === "owner" ? "Your list" : "Shared with you"}`}
      accessibilityHint="Opens this list. Long press for actions."
      onLongPress={Platform.OS === "ios" ? undefined : onActions}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        minHeight: 164,
        padding: 16,
        gap: 22,
        borderRadius: 20,
        borderCurve: "continuous",
        backgroundColor: list.color,
        opacity: pressed ? 0.8 : 1,
      }}
    >
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
