import { buttonBorderShape, buttonStyle, controlSize } from "@expo/ui/swift-ui/modifiers";

export const wideButtonModifiers = (appearance: "glass" | "glassProminent") => [buttonBorderShape("capsule"), buttonStyle(appearance), controlSize("extraLarge")];
