import { Button, Column, FieldGroup, Host, Text } from "@expo/ui";
import { Children, useState } from "react";
import { View, useWindowDimensions } from "react-native";

export function SheetForm({ children, error, submitLabel, disabled, pending, onSubmit }: {
  children: React.ReactNode;
  error?: string;
  submitLabel: string;
  disabled: boolean;
  pending: boolean;
  onSubmit(): void;
}) {
  const { fontScale, width: screenWidth } = useWindowDimensions();
  const [width, setWidth] = useState(screenWidth);
  return (
    <View
      style={{ flex: 1 }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Column spacing={8} style={{ width }}>
          <FieldGroup
            disabled={pending}
            style={{ width, height: Children.count(children) * 64 * Math.max(1, fontScale) + 32 }}
          >
            {children}
          </FieldGroup>
          <Column spacing={12} style={{ paddingHorizontal: 16 }}>
            {error ? <Text>{error}</Text> : null}
            <Button
              disabled={disabled}
              onPress={onSubmit}
              style={{ width: Math.max(0, width - 32), paddingVertical: 12 }}
            >
              <Text
                style={{ width: Math.max(0, width - 64) }}
                textStyle={{ textAlign: "center", fontWeight: "600" }}
              >
                {submitLabel}
              </Text>
            </Button>
          </Column>
        </Column>
      </Host>
    </View>
  );
}
