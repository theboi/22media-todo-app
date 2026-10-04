import type { SymbolView } from "expo-symbols";
export type ActionMenuProps = { children: React.ReactNode; actions: { id: string; title: string; destructive?: boolean; disabled?: boolean; icon?: Extract<React.ComponentProps<typeof SymbolView>["name"], object> }[]; longPress?: boolean; onPress?(): void; label?: string; onAction(id: string): void };
