import { MenuView } from "@expo/ui/community/menu";
import type { ActionMenuProps } from "./action-menu-types";
export function ActionMenu({ children, actions, onAction }: ActionMenuProps) {
  return <MenuView actions={actions.map(action => ({ id: action.id, title: action.title, attributes: { destructive: action.destructive, disabled: action.disabled } }))} onPressAction={event => onAction(event.nativeEvent.event)}>{children}</MenuView>;
}
