import { ListItem, RNHostView, Text } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef } from "react";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable } from "react-native";
import { useTheme, useRouter } from "expo-router";
import { SwipeDelete } from "@/components/ui/swipe-delete";
import { invalidateList } from "@/lib/api/invalidate-list";
import { setTodoDone, deleteTodo } from "@/lib/api/todos";
import type { Todo } from "@/lib/api/list-detail";

export function TodoRow({ todo }: { todo: Todo }) {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const completion = useMutation({
    mutationFn: setTodoDone,
    networkMode: "always",
    onSettled: () => { inFlight.current = false; },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", todo.listId] }),
        queryClient.invalidateQueries({ queryKey: ["todos"] }),
      ]);
    },
  });
  const toggle = () => {
    if (inFlight.current) return;
    inFlight.current = true;
    completion.mutate({ id: todo.id, isDone: !todo.isDone, key: randomUUID() });
  };
  const remove = useMutation({ mutationFn: deleteTodo, networkMode: "always", onSettled: () => { inFlight.current = false; }, onSuccess: async () => {
    queryClient.removeQueries({ queryKey: ["todo", todo.id] });
    await invalidateList(queryClient, todo.listId);
  } });
  const busy = completion.isPending || remove.isPending;
  const edit = () => { if (!busy) router.push({ pathname: "/edit-todo", params: { todoId: todo.id } }); };
  const supporting = [
    todo.description,
    todo.deadline ? `Due ${new Date(todo.deadline).toLocaleString()}` : null,
    completion.error?.message,
    remove.error?.message,
  ].filter(Boolean).join(" · ");
  const checkbox = (
        <Pressable
          accessibilityRole="checkbox"
          aria-checked={todo.isDone}
          aria-disabled={busy}
          accessibilityLabel={todo.name}
          accessibilityState={{ checked: todo.isDone, disabled: busy }}
          accessibilityHint={todo.isDone ? "Mark incomplete" : "Mark complete"}
          disabled={busy}
          onPress={(event) => {
            event.stopPropagation();
            toggle();
          }}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: busy ? 0.4 : 1 }}
        >
          <SymbolView
            name={{
              ios: todo.isDone ? "checkmark.circle.fill" : "circle",
              android: todo.isDone ? "check_circle" : "radio_button_unchecked",
              web: todo.isDone ? "check_circle" : "radio_button_unchecked",
            }}
            tintColor={colors.primary}
            size={26}
            accessible={false}
          />
        </Pressable>
  );
  return (
    <SwipeDelete disabled={busy} onDelete={() => { if (inFlight.current) return; inFlight.current = true; remove.mutate({ id: todo.id, key: randomUUID() }); }}>
    <ListItem
      supportingText={supporting !== "" ? <Text onPress={edit} textStyle={{ fontSize: 13, color: "#8E8E93" }}>{supporting}</Text> : null}
      trailing={
        Platform.OS === "android" ? <RNHostView matchContents>{checkbox}</RNHostView> : checkbox
      }
    >
      <Text onPress={edit} textStyle={todo.isDone ? { color: "#8E8E93" } : undefined}>{todo.name}</Text>
    </ListItem>
    </SwipeDelete>
  );
}
