import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { deleteList } from "@/lib/api/todo-lists";
import { invalidateList } from "@/lib/api/invalidate-list";
import type { TodoList } from "@/lib/api/lists";

export function DeleteListDialog({ list, onDismiss, onDeleted }: { list: TodoList; onDismiss(): void; onDeleted?(): void }) {
  const [key] = useState(randomUUID);
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => deleteList({ id: list.id, key }), networkMode: "always",
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["list", list.id] });
      queryClient.removeQueries({ queryKey: ["list", list.id] });
      onDeleted?.();
      await invalidateList(queryClient, list.id);
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      onDismiss();
    },
  });
  return <AlertDialog title={`Delete “${list.name}”?`} message="This permanently deletes the list and all its todos." confirmLabel="Delete" pending={remove.isPending} error={remove.error?.message} onConfirm={() => { if (!remove.isPending && list.role === "owner") remove.mutate(); }} onCancel={onDismiss} />;
}
