import { Text, View } from "react-native";
import { ListIcon } from "./list-icon";
import { useSurfaceColors } from "@/hooks/use-surface-colors";
import type { Todo } from "@/lib/api/list-detail";
export function TodoRow({ todo }: { todo: Todo }) {
  const colors = useSurfaceColors();
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 16,
        backgroundColor: colors.card,
        flexDirection: "row",
        gap: 14,
      }}
    >
      <ListIcon
        name={todo.isDone ? "check" : "droplet"}
        color={colors.secondaryText}
        size={22}
      />
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            textDecorationLine: todo.isDone ? "line-through" : "none",
          }}
        >
          {todo.name}
        </Text>
        {todo.description && (
          <Text style={{ color: colors.secondaryText }}>
            {todo.description}
          </Text>
        )}
        <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
          {todo.isDone ? "Completed" : "Outstanding"}
          {todo.deadline
            ? ` · Due ${new Date(todo.deadline).toLocaleString()}`
            : ""}
        </Text>
      </View>
    </View>
  );
}
