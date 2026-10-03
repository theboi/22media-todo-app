import type { QueryClient } from "@tanstack/react-query";

export async function recoverAccountQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["list"] }),
    queryClient.invalidateQueries({ queryKey: ["todo-lists"] }),
    queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
    queryClient.invalidateQueries({ queryKey: ["todos"] }),
    queryClient.invalidateQueries({ queryKey: ["pinned-lists"] }),
  ]);
}
