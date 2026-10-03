import { FieldGroup, Host, List, ListItem, Text } from "@expo/ui";
import type { ReactNode } from "react";
import type { Todo } from "@/lib/api/list-detail";
import { TodoRow } from "./todo-row";

export type TodoListSection = {
  id: string;
  title?: string;
  todos: Todo[];
  emptyText: string;
  onOpen?(): void;
};

export function TodoList({ sections, header, onRefresh }: {
  sections: TodoListSection[];
  header?: ReactNode;
  onRefresh(): Promise<void>;
}) {
  return (
    <Host style={{ flex: 1 }}>
      <List onRefresh={onRefresh}>
        {header}
        {sections.map(section => (
          <FieldGroup.Section key={section.id} title={section.onOpen ? undefined : section.title}>
            {section.onOpen && (
              <FieldGroup.SectionHeader>
                <ListItem onPress={section.onOpen}><Text textStyle={{ fontWeight: "bold" }}>{section.title ?? "List"}</Text></ListItem>
              </FieldGroup.SectionHeader>
            )}
            {section.todos.length ? section.todos.map(todo => <TodoRow key={todo.id} todo={todo} />) : <Text textStyle={{ color: "#8E8E93" }}>{section.emptyText}</Text>}
          </FieldGroup.Section>
        ))}
      </List>
    </Host>
  );
}
