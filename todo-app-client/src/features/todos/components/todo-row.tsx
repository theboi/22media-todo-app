import { TodoRowContent } from "./todo-row-content";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef } from "react";
import { useRouter } from "expo-router";
import { SwipeDelete } from "@/components/ui/swipe-delete";
import { invalidateList } from "@/lib/api/invalidate-list";
import { setTodoDone, deleteTodo } from "@/lib/api/todos";
import type { Todo } from "@/lib/api/list-detail";

export function TodoRow({ todo }: { todo: Todo }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const completion = useMutation({
    mutationFn: setTodoDone,
    networkMode: "always",
    onSettled: () => { inFlight.current = false; },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["list", todo.listId] }),
        queryClient.invalidateQueries({ queryKey: ["todos"] }),
      ]);
    },
  });
  const toggle = () => {
    if (inFlight.current) return;
    inFlight.current = true;
    completion.mutate({ id: todo.id, isDone: !todo.isDone, key: randomUUID() });
  };
  const remove = useMutation({ mutationFn: deleteTodo, networkMode: "always", onSettled: () => { inFlight.current = false; }, onSuccess: async () => {
    queryClient.removeQueries({ queryKey: ["todo", todo.id] });
    await invalidateList(queryClient, todo.listId);
  } });
  const busy = completion.isPending || remove.isPending;
  const edit = () => { if (!busy) router.push({ pathname: "/edit-todo", params: { todoId: todo.id } }); };
  const supporting = [
    todo.description,
    todo.deadline ? `Due ${new Date(todo.deadline).toLocaleString()}` : null,
    completion.error?.message,
    remove.error?.message,
  ].filter(Boolean).join(" · ");

  return (
    <SwipeDelete disabled={busy} onDelete={() => { if (inFlight.current) return; inFlight.current = true; remove.mutate({ id: todo.id, key: randomUUID() }); }}>
    <TodoRowContent todo={todo} supporting={supporting} disabled={busy} onToggle={toggle} onDescription={edit} />
    </SwipeDelete>
  );
}
