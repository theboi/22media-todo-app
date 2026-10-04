import { WideButton } from "@/components/ui/wide-button";
import { FormFields } from "@/components/ui/form-fields";
import { Column, Host, Text } from "@expo/ui";
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
  onCancel,
  footer,
}: {
  children: React.ReactNode;
  error?: string;
  submitLabel: string;
  disabled: boolean;
  pending: boolean;
  onSubmit(): void;
  fieldCount?: number;
  onCancel?(): void;
  footer?: React.ReactNode;
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
            {footer}
            <WideButton label={submitLabel} disabled={disabled} onPress={onSubmit} width={Math.max(0, width - 32)} />
            {onCancel && <WideButton label="Cancel" variant="outlined" appearance="glass" disabled={pending} onPress={onCancel} width={Math.max(0, width - 32)} />}

          </Column>
        </Column>
      </Host>
    </ScrollView>
  );
}
