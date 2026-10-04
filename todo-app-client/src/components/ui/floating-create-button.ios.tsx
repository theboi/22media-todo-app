import { Host } from "@expo/ui";
import { Button } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  frame,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";

export function FloatingCreateButton({ onPress }: { onPress(): void }) {
  return (
    <Host style={{ width: 64, height: 64 }} ignoreSafeArea="all">
      <Button
        label="New todo"
        systemImage="plus"
        onPress={onPress}
        modifiers={[
          labelStyle("iconOnly"),
          buttonStyle("glassProminent"),
          buttonBorderShape("circle"),
          controlSize("extraLarge"),
          frame({ width: 64, height: 64 }),
          accessibilityLabel("New todo"),
        ]}
      />
    </Host>
  );
}
