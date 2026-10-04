import {
  FlatList,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { TodoList } from "@/lib/api/lists";

export function ListGrid({
  lists,
  renderCard,
  header,
  footer,
  empty,
  refreshing,
  onRefresh,
  style,
}: {
  lists: TodoList[];
  renderCard(list: TodoList): React.ReactElement;
  header?: React.ReactElement | null;
  footer?: React.ReactElement | null;
  empty?: React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?(): void;
  style?: StyleProp<ViewStyle>;
}) {
  const dimensions = useWindowDimensions();
  const width = Math.min(dimensions.width, 720);
  const columns = width < 360 || dimensions.fontScale > 1.4 ? 1 : 2;
  const cardWidth = Math.max(1, (width - 40 - 12 * (columns - 1)) / columns);

  return (
    <FlatList
      key={columns}
      style={[{ flex: 1 }, style]}
      data={lists}
      numColumns={columns}
      keyExtractor={(list) => list.id}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>{renderCard(item)}</View>
      )}
      columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
      contentContainerStyle={{
        padding: 20,
        gap: 12,
        flexGrow: 1,
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
      }}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListFooterComponentStyle={
        footer ? { flexGrow: 1, justifyContent: "flex-end" } : undefined
      }
      ListEmptyComponent={empty}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
