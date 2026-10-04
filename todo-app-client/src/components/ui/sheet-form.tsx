import { FormFields } from "@/components/ui/form-fields";
import { Button, Column, Host, Text } from "@expo/ui";
import { buttonBorderShape, buttonStyle, controlSize } from "@expo/ui/swift-ui/modifiers";
import { Children, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";

export function SheetForm({
  children,
  error,
  submitLabel,
  disabled,
  pending,
  onSubmit,
  fieldCount,
}: {
  children: React.ReactNode;
  error?: string;
  submitLabel: string;
  disabled: boolean;
  pending: boolean;
  onSubmit(): void;
  fieldCount?: number;
}) {
  const { fontScale, width: screenWidth } = useWindowDimensions();
  const [width, setWidth] = useState(screenWidth);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1 }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Column spacing={8} style={{ width }}>
          <FormFields
            disabled={pending}
            width={width}
            height={(fieldCount ?? Children.count(children)) * 70 * Math.max(1, fontScale) + 32}
          >
            {children}
          </FormFields>
          <Column spacing={12} style={{ paddingHorizontal: 16 }}>
            {error ? <Text>{error}</Text> : null}
            <Button
              disabled={disabled}
              onPress={onSubmit}
              style={{ paddingVertical: 12 }}
              modifiers={[
                buttonBorderShape("capsule"),
                buttonStyle("glassProminent"),
                controlSize('extraLarge'),
              ]}
            >
              <Text
                style={{ width: Math.max(0, width - 72) }}
                textStyle={{ textAlign: "center", fontWeight: "600" }}
              >
                {submitLabel}
              </Text>
            </Button>
          </Column>
        </Column>
      </Host>
    </ScrollView>
  );
}
