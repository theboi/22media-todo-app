import { ListItem, RNHostView, Text } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable } from "react-native";
import { useTheme } from "expo-router";
import { TodoName } from "./todo-name";
import type { TodoRowContentProps } from "./todo-row-content-types";

export function TodoRowContent({ todo, supporting, disabled, onToggle, onDescription }: TodoRowContentProps) {
  const { colors } = useTheme();
  const checkbox = (
        <Pressable
          accessibilityRole="checkbox"
          aria-checked={todo.isDone}
          aria-disabled={disabled}
          accessibilityLabel={todo.name}
          accessibilityState={{ checked: todo.isDone, disabled }}
          accessibilityHint={todo.isDone ? "Mark incomplete" : "Mark complete"}
          disabled={disabled}
          onPress={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}
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
  return <ListItem supportingText={supporting !== "" ? <Text textStyle={{ fontSize: 13, color: "#8E8E93" }}>{supporting}</Text> : null} trailing={Platform.OS === "android" ? <RNHostView matchContents>{checkbox}</RNHostView> : checkbox}>
    <TodoName todo={todo} disabled={disabled} onDescription={onDescription} />
  </ListItem>;
}
