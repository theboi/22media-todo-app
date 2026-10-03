import { Color, useTheme } from "expo-router";
import { Platform, useColorScheme } from "react-native";

export function useSurfaceColors() {
  const { colors } = useTheme();
  useColorScheme();
  
  return {
    text: Platform.select({
      ios: Color.ios.label,
      android: Color.android.dynamic.onSurface,
      default: colors.text,
    }),
    secondaryText: Platform.select({
      ios: Color.ios.secondaryLabel,
      android: Color.android.dynamic.onSurfaceVariant,
      default: colors.text,
    }),
    background: Platform.select({
      ios: Color.ios.systemGroupedBackground,
      android: Color.android.dynamic.surface,
      default: colors.background,
    }),
    card: Platform.select({
      ios: Color.ios.secondarySystemGroupedBackground,
      android: Color.android.dynamic.surfaceContainer,
      default: colors.card,
    }),
    border: Platform.select({
      ios: Color.ios.separator,
      android: Color.android.dynamic.outlineVariant,
      default: colors.border,
    }),
  };
}
