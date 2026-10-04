import { ColorPicker } from "@expo/ui/swift-ui";
import { disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";

export function ColorField({ value, onChange, disabled }: { value: string; onChange(value: string): void; disabled: boolean }) {
  return <ColorPicker label="Color" selection={value} supportsOpacity={false} onSelectionChange={onChange} modifiers={[disabledModifier(disabled)]} />;
}
