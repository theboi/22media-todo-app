import { View } from "react-native";
import { IconButton } from "@/components/ui/icon-button";
import { ActionMenu } from "@/components/ui/action-menu";
export function ListHeaderActions({ owner, onCreate, onShare, onRename, onDelete }: { owner: boolean; onCreate(): void; onShare(): void; onRename(): void; onDelete(): void }) {
  return <View style={{ flexDirection: "row" }}>
    <IconButton label="New todo" name={{ ios: "plus", android: "add", web: "add" }} color="#FFFFFF" onPress={onCreate} />
    <IconButton label="Share list" name={{ ios: "square.and.arrow.up", android: "share", web: "share" }} color="#FFFFFF" disabled={!owner} onPress={onShare} />
    <ActionMenu actions={[{ id: "rename", title: "Rename", disabled: !owner }, { id: "delete", title: "Delete", destructive: true, disabled: !owner }]} onAction={action => { if (action === "rename") onRename(); if (action === "delete") onDelete(); }}>
      <IconButton label="List actions" name={{ ios: "ellipsis", android: "more_horiz", web: "more_horiz" }} color="#FFFFFF" />
    </ActionMenu>
  </View>;
}
