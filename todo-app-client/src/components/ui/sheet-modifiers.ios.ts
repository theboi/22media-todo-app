import { interactiveDismissDisabled } from "@expo/ui/swift-ui/modifiers";
export const sheetDismissModifiers = (pending: boolean) => [interactiveDismissDisabled(pending)];
