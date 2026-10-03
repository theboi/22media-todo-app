import { ListItem, Text } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";
import { useTheme } from "expo-router";
import { setTodoDone } from "@/lib/api/todos";
import type { Todo } from "@/lib/api/list-detail";

export function TodoRow({ todo }: { todo: Todo }) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const completion = useMutation({
    mutationFn: setTodoDone,
    networkMode: "always",
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", todo.listId] }),
        queryClient.invalidateQueries({ queryKey: ["todos"] }),
      ]);
    },
  });
  const supporting = [
    todo.description,
    todo.deadline ? `Due ${new Date(todo.deadline).toLocaleString()}` : null,
    todo.isDone ? "Completed" : "Incomplete",
    completion.isPending ? "Saving…" : null,
    completion.error?.message,
  ].filter(Boolean).join(" · ");
  return (
    <ListItem
      supportingText={<Text textStyle={{ fontSize: 13, color: "#8E8E93" }}>{supporting}</Text>}
      trailing={
        <Pressable
          accessibilityRole="checkbox"
          aria-checked={todo.isDone}
          aria-disabled={completion.isPending}
          accessibilityLabel={todo.name}
          accessibilityState={{ checked: todo.isDone, disabled: completion.isPending }}
          accessibilityHint={todo.isDone ? "Mark incomplete" : "Mark complete"}
          disabled={completion.isPending}
          onPress={() => completion.mutate({ id: todo.id, isDone: !todo.isDone, key: randomUUID() })}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: completion.isPending ? 0.4 : 1 }}
        >
          <SymbolView
            name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }}
            tintColor={todo.isDone ? "#8E8E93" : colors.primary}
            size={26}
            accessible={false}
          />
        </Pressable>
      }
    >
      <Text textStyle={todo.isDone ? { color: "#8E8E93" } : undefined}>{todo.name}</Text>
    </ListItem>
  );
}
