import { BottomSheet, Button, Column, Text } from "@expo/ui";
import { useState } from "react";
import type { TodoList } from "@/lib/api/lists";
import { DeleteListDialog } from "./delete-list-dialog";

export function ListActionsSheet({ list, confirm, onDismiss, onEdit, onShare, onDeleted }: { list: TodoList; confirm: boolean; onDismiss(): void; onEdit(): void; onShare(): void; onDeleted?(): void }) {
  const [confirming, setConfirming] = useState(confirm);
  if (confirming) return <DeleteListDialog list={list} onDismiss={onDismiss} onDeleted={onDeleted} />;
  return <BottomSheet isPresented onDismiss={onDismiss}><Column spacing={16} style={{ padding: 24 }}>
    <Text textStyle={{ fontWeight: "700", fontSize: 22 }}>{list.name}</Text>
    <Button label="Rename" disabled={list.role !== "owner"} onPress={onEdit} />
    <Button label="Share" disabled={list.role !== "owner"} onPress={onShare} />
    <Button label="Delete" disabled={list.role !== "owner"} onPress={() => setConfirming(true)} />
    <Button label="Cancel" variant="text" onPress={onDismiss} />
  </Column></BottomSheet>;
}
