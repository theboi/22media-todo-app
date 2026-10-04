import { TextInput } from "@expo/ui";
import { Button, ContextMenu, Text, VStack } from "@expo/ui/swift-ui";
import { accessibilityHint, buttonStyle, disabled as disabledModifier, fixedSize, foregroundStyle, frame, multilineTextAlignment } from "@expo/ui/swift-ui/modifiers";
import type { Todo } from "@/lib/api/list-detail";
import { useTodoName } from "../hooks/use-todo-name";

export function TodoName({ todo, disabled, onDescription }: { todo: Todo; disabled: boolean; onDescription(): void }) {
  const name = useTodoName(todo, disabled);
  return <VStack alignment="leading" spacing={4} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
    {name.editing ? <TextInput defaultValue={name.draft} autoFocus maxLength={200} returnKeyType="done" textAlign="left" editable={!name.pending && !disabled} onChangeText={name.change} onSubmitEditing={name.submit} onBlur={name.submit} /> :
      <ContextMenu>
        <ContextMenu.Trigger>
          <Button onPress={name.start} modifiers={[buttonStyle("borderless"), disabledModifier(disabled), accessibilityHint("Tap to edit name. Long press to edit description."), frame({ maxWidth: Infinity, alignment: "leading" })]}>
            <Text modifiers={[foregroundStyle(todo.isDone ? "secondaryLabel" : "label"), multilineTextAlignment("leading"), fixedSize({ horizontal: false, vertical: true })]}>{todo.name}</Text>
          </Button>
        </ContextMenu.Trigger>
        <ContextMenu.Items><Button label={todo.description ? "Edit Description" : "Add Description"} systemImage="text.alignleft" onPress={onDescription} modifiers={[disabledModifier(disabled)]} /></ContextMenu.Items>
      </ContextMenu>}
    {name.error && <Text modifiers={[foregroundStyle("systemRed")]}>{name.error}</Text>}
  </VStack>;
}
