import { FieldGroup } from "@expo/ui";
import { scrollDisabled } from "@expo/ui/swift-ui/modifiers";

export function FormFields({ children, disabled, width, height }: { children: React.ReactNode; disabled: boolean; width: number; height: number }) {
  return <FieldGroup disabled={disabled} style={{ width, height }} modifiers={[scrollDisabled(true)]}>{children}</FieldGroup>;
}
