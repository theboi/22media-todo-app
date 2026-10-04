import { useTodoName } from "../hooks/use-todo-name";
import { RNHostView } from "@expo/ui";
import { Text, TextInput, View, useWindowDimensions } from "react-native";
import { useTheme } from "expo-router";
import { ActionMenu } from "@/components/ui/action-menu";
import type { Todo } from "@/lib/api/list-detail";

export function TodoName({ todo, disabled, onDescription }: { todo: Todo; disabled: boolean; onDescription(): void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const name = useTodoName(todo, disabled);
  return <RNHostView matchContents><View style={{ width: Math.max(120, Math.min(width, 720) - 112) }}>
    {name.editing ? <TextInput accessibilityLabel="Todo name" defaultValue={name.draft} autoFocus maxLength={200} returnKeyType="done" editable={!name.pending && !disabled} onChangeText={name.change} onSubmitEditing={name.submit} onBlur={name.submit} style={{ fontSize: 17, color: colors.text, paddingVertical: 8 }} /> :
      <ActionMenu longPress label={`${todo.name}. Tap to rename; long press for description`} actions={[{ id: "description", title: todo.description ? "Edit Description" : "Add Description", icon: { ios: "text.alignleft", android: "notes", web: "notes" }, disabled: disabled || name.pending }]} onAction={onDescription} onPress={name.start}>
        <Text style={{ fontSize: 17, textAlign: "left", paddingVertical: 6, color: todo.isDone ? "#8E8E93" : colors.text }}>{todo.name}</Text>
      </ActionMenu>}
    {name.error ? <Text accessibilityRole="alert" style={{ color: colors.notification }}>{name.error}</Text> : null}
  </View></RNHostView>;
}
