import { MenuView, type MenuComponentRef } from "@expo/ui/community/menu";
import { useRef } from "react";
import { Platform, Pressable } from "react-native";
import type { ActionMenuProps } from "./action-menu-types";
const MENU_ICONS = {
  edit: require("../../../assets/images/menu/edit.png"),
  notes: require("../../../assets/images/menu/notes.png"),
  delete: require("../../../assets/images/menu/delete.png"),
};
const androidImage = (icon: ActionMenuProps["actions"][number]["icon"]) => {
  const name = icon?.android;
  return name === "edit" || name === "notes" || name === "delete" ? MENU_ICONS[name] : undefined;
};
export function ActionMenu({ children, actions, onAction, longPress, onPress, label }: ActionMenuProps) {
  const menu = useRef<MenuComponentRef>(null);
  return <MenuView ref={menu} shouldOpenOnLongPress={longPress} actions={actions.map(action => ({ id: action.id, title: action.title, image: Platform.OS === "ios" ? action.icon?.ios : androidImage(action.icon), attributes: { destructive: action.destructive, disabled: action.disabled } }))} onPressAction={event => onAction(event.nativeEvent.event)}>
    {onPress ? <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} onLongPress={Platform.OS === "android" && longPress ? () => menu.current?.show() : undefined}>{children}</Pressable> : children}
  </MenuView>;
}
