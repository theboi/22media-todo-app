import type { QueryClient } from "@tanstack/react-query";
export async function invalidateList(queryClient: QueryClient, id: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["list", id] }),
    queryClient.invalidateQueries({ queryKey: ["todo-lists"] }),
    queryClient.invalidateQueries({ queryKey: ["todos"] }),
    queryClient.invalidateQueries({ queryKey: ["pinned-lists"] }),
  ]);
}
