import { Button, Column, FieldGroup, List, Text } from "@expo/ui";
import type * as React from "react";
import { useWindowDimensions } from "react-native";

export function SheetForm({ title, children, error, submitLabel, disabled, pending, onSubmit, onCancel }: {
  title: string;
  children: React.ReactNode;
  error?: string;
  submitLabel: string;
  disabled: boolean;
  pending: boolean;
  onSubmit(): void;
  onCancel(): void;
}) {
  const { height } = useWindowDimensions();
  return (
    <Column style={{ height: height * 0.8 }}>
      <List>
        <FieldGroup.Section>
          <Text textStyle={{ fontSize: 24, fontWeight: "bold" }}>{title}</Text>
        </FieldGroup.Section>
        {children}
        <FieldGroup.Section>
          {error && <Text>{error}</Text>}
          <Button label={submitLabel} disabled={disabled} onPress={onSubmit} />
          <Button label="Cancel" variant="text" disabled={pending} onPress={onCancel} />
        </FieldGroup.Section>
      </List>
    </Column>
  );
}
