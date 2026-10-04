import { Button, HStack, Text, VStack } from "@expo/ui/swift-ui";
import { accessibilityLabel, accessibilityValue, buttonStyle, disabled, font, foregroundStyle, frame, labelStyle, layoutPriority, tint } from "@expo/ui/swift-ui/modifiers";
import { useTheme } from "expo-router";
import { TodoName } from "./todo-name";
import type { TodoRowContentProps } from "./todo-row-content-types";

export function TodoRowContent({ todo, supporting, disabled: busy, onToggle, onDescription }: TodoRowContentProps) {
  const { colors } = useTheme();
  return <HStack spacing={12} alignment="center">
    <VStack alignment="leading" spacing={4} modifiers={[frame({ maxWidth: Infinity, alignment: "leading" }), layoutPriority(1)]}>
      <TodoName todo={todo} disabled={busy} onDescription={onDescription} />
      {supporting !== "" && <Text modifiers={[font({ textStyle: "caption" }), foregroundStyle("secondaryLabel")]}>{supporting}</Text>}
    </VStack>
    <Button label={todo.isDone ? "Mark incomplete" : "Mark complete"} systemImage={todo.isDone ? "checkmark.circle.fill" : "circle"} onPress={onToggle} modifiers={[buttonStyle("borderless"), labelStyle("iconOnly"), font({ size: 26 }), tint(colors.primary), disabled(busy), frame({ width: 44, height: 44 }), accessibilityLabel(`${todo.name}, ${todo.isDone ? "mark incomplete" : "mark complete"}`), accessibilityValue(todo.isDone ? "Complete" : "Incomplete")]} />
  </HStack>;
}
