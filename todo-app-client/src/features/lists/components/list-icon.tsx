import type * as React from "react";
import { SymbolView } from "expo-symbols";
import type { ColorValue } from "react-native";

const ICONS: Record<string, React.ComponentProps<typeof SymbolView>["name"]> = {
  droplet: { ios: "drop.fill", android: "water_drop", web: "water_drop" },
  home: { ios: "house.fill", android: "home", web: "home" },
  briefcase: { ios: "briefcase.fill", android: "work", web: "work" },
  book: { ios: "book.fill", android: "menu_book", web: "menu_book" },
  heart: { ios: "heart.fill", android: "favorite", web: "favorite" },
  cart: { ios: "cart.fill", android: "shopping_cart", web: "shopping_cart" },
  star: { ios: "star.fill", android: "star", web: "star" },
  check: {
    ios: "checkmark.circle.fill",
    android: "check_circle",
    web: "check_circle",
  },
};
export function ListIcon({
  name,
  color,
  size = 28,
}: {
  name: string;
  color?: ColorValue;
  size?: number;
}) {
  return (
    <SymbolView
      accessible={false}
      name={
        ICONS[name] ?? { ios: "folder.fill", android: "folder", web: "folder" }
      }
      tintColor={color}
      size={size}
    />
  );
}
