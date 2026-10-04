import type * as React from "react";
import { useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import type { TodoList } from "@/lib/api/lists";

export function ListGrid({ lists, renderCard, header, empty, refreshing, onRefresh }: {
  lists: TodoList[];
  renderCard(list: TodoList): React.ReactElement;
  header?: React.ReactElement | null;
  empty?: React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?(): void;
}) {
  const dimensions = useWindowDimensions();
  const [availableWidth, setAvailableWidth] = useState(dimensions.width);
  const width = Math.min(availableWidth, 720);
  const columns = width < 360 || dimensions.fontScale > 1.4 ? 1 : 2;
  const cardWidth = Math.max(1, (width - 40 - 12 * (columns - 1)) / columns);
  
  return (
    <View
      style={{ flex: 1, width: "100%", maxWidth: 720, alignSelf: "center" }}
      onLayout={({ nativeEvent }) => {
        if (nativeEvent.layout.width > 0) setAvailableWidth(nativeEvent.layout.width);
      }}
    >
      <FlatList
        key={columns}
        data={lists}
        numColumns={columns}
        keyExtractor={(list) => list.id}
        renderItem={({ item }) => <View style={{ width: cardWidth }}>{renderCard(item)}</View>}
        columnWrapperStyle={columns > 1 ? { gap: 12 } : undefined}
        contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
