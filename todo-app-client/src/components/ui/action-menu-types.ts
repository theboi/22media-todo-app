export type ActionMenuProps = { children: React.ReactNode; actions: { id: string; title: string; destructive?: boolean; disabled?: boolean }[]; onAction(id: string): void };
