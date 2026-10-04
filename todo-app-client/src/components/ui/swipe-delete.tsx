import { Column, Button } from "@expo/ui";
export function SwipeDelete({ children, onDelete, disabled }: { children: React.ReactNode; onDelete(): void; disabled: boolean }) {
  return <Column>{children}<Button label="Delete Todo" variant="text" disabled={disabled} onPress={onDelete} /></Column>;
}
