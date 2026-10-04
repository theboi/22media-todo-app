import { RNHostView } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { Text, TextInput, View, useWindowDimensions } from "react-native";
import { useTheme } from "expo-router";
import { ActionMenu } from "@/components/ui/action-menu";
import { updateTodoName } from "@/lib/api/todos";
import { invalidateList } from "@/lib/api/invalidate-list";
import type { Todo } from "@/lib/api/list-detail";

export function TodoName({ todo, disabled, onDescription }: { todo: Todo; disabled: boolean; onDescription(): void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.name);
  const [validation, setValidation] = useState<string>();
  const attempt = useRef<Parameters<typeof updateTodoName>[0] | null>(null);
  const saving = useRef(false);
  const save = useMutation({ mutationFn: updateTodoName, networkMode: "always", onSettled: () => { saving.current = false; }, onSuccess: async value => {
    setEditing(false);
    client.setQueryData(["todo", todo.id], value);
    await invalidateList(client, todo.listId);
  } });
  const submit = () => {
    if (saving.current || disabled) return;
    const name = draft.trim();
    if (!name) { setValidation("Enter a todo name."); return; }
    if (name === todo.name) { setEditing(false); return; }
    if (!attempt.current || attempt.current.name !== name) attempt.current = { id: todo.id, name, key: randomUUID() };
    saving.current = true;
    save.mutate(attempt.current);
  };
  return <RNHostView matchContents><View style={{ width: Math.max(120, Math.min(width, 720) - 112) }}>
    {editing ? <TextInput accessibilityLabel="Todo name" defaultValue={draft} autoFocus maxLength={200} returnKeyType="done" editable={!save.isPending && !disabled} onChangeText={value => { setDraft(value); setValidation(undefined); }} onSubmitEditing={submit} onBlur={submit} style={{ fontSize: 17, color: colors.text, paddingVertical: 8 }} /> :
      <ActionMenu longPress label={`${todo.name}. Tap to rename; long press for description`} actions={[{ id: "description", title: todo.description ? "Edit Description" : "Add Description", icon: { ios: "text.alignleft", android: "notes", web: "notes" }, disabled: disabled || save.isPending }]} onAction={onDescription} onPress={() => { if (disabled) return; setDraft(todo.name); setValidation(undefined); save.reset(); setEditing(true); }}>
        <Text style={{ fontSize: 17, paddingVertical: 6, color: todo.isDone ? "#8E8E93" : colors.text }}>{todo.name}</Text>
      </ActionMenu>}
    {validation || save.error ? <Text accessibilityRole="alert" style={{ color: colors.notification }}>{validation ?? save.error?.message}</Text> : null}
  </View></RNHostView>;
}
