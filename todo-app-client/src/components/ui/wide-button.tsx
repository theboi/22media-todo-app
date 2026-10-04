import { Button, Text } from "@expo/ui";
import { buttonBorderShape, buttonStyle, controlSize } from "@expo/ui/swift-ui/modifiers";
import { useWindowDimensions } from "react-native";

export function WideButton({ label, children, width, appearance = "glassProminent", style, modifiers, ...props }: React.ComponentProps<typeof Button> & { width?: number; appearance?: "glass" | "glassProminent" }) {
  const window = useWindowDimensions();
  const size = typeof style?.width === "number" ? style.width : width ?? window.width - 32;
  return <Button {...props} style={{ paddingVertical: 12, ...style, width: size }} modifiers={[buttonBorderShape("capsule"), buttonStyle(appearance), controlSize("extraLarge"), ...(modifiers ?? [])]}>
    {children ?? <Text style={{ width: Math.max(0, size - 40) }} textStyle={{ textAlign: "center", fontWeight: "600" }}>{label}</Text>}
  </Button>;
}
