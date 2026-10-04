import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { IconButton } from "@/components/ui/icon-button";
import { ActionMenu } from "@/components/ui/action-menu";
export function ListHeaderActions({ owner, hasDescription, onShare, onRename, onDescription, onDelete }: { owner: boolean; hasDescription: boolean; onShare(): void; onRename(): void; onDescription(): void; onDelete(): void }) {
  return <View style={{ flexDirection: "row" }}>
    <IconButton label="Share list" name={{ ios: "square.and.arrow.up", android: "share", web: "share" }} color="#FFFFFF" disabled={!owner} onPress={onShare} />
    <ActionMenu actions={[
      { id: "rename", title: "Rename", icon: { ios: "pencil", android: "edit", web: "edit" }, disabled: !owner },
      { id: "description", title: hasDescription ? "Edit Description" : "Add Description", icon: { ios: "text.alignleft", android: "notes", web: "notes" }, disabled: !owner },
      { id: "delete", title: "Delete", icon: { ios: "trash", android: "delete", web: "delete" }, destructive: true, disabled: !owner },
    ]} onAction={action => { if (action === "rename") onRename(); if (action === "description") onDescription(); if (action === "delete") onDelete(); }}>
      <View accessibilityLabel="List actions" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}><SymbolView name={{ ios: "ellipsis", android: "more_horiz", web: "more_horiz" }} tintColor="#FFFFFF" size={24} accessible={false} /></View>
    </ActionMenu>
  </View>;
}
