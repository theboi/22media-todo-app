import { Column } from "@expo/ui";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

// A non-scrolling group on Android/web, where FieldGroup has no scroll switch.
export function FormFields({ children, disabled, width }: { children: React.ReactNode; disabled: boolean; width: number; height: number }) {
  const colors = useSurfaceColors();
  return (
    <Column disabled={disabled} style={{ width, padding: 16 }}>
      <Column spacing={8} style={{ width: Math.max(0, width - 32), padding: 16, borderRadius: 12, backgroundColor: colors.card }}>
        {children}
      </Column>
    </Column>
  );
}
