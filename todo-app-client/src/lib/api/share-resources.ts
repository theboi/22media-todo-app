export type ListShare = { id: string; listId: string; listName: string; email: string; sender: string; status: "pending" | "accepted" };
export function readShares(value: unknown): ListShare[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid invitations.");
  return value.map((item: unknown) => {
    if (typeof item !== "object" || item === null || !("id" in item) || typeof item.id !== "string" || !("todo_list_id" in item) || typeof item.todo_list_id !== "string" || !("todo_list_name" in item) || typeof item.todo_list_name !== "string" || !("email" in item) || typeof item.email !== "string" || !("status" in item) || (item.status !== "pending" && item.status !== "accepted") || !("shared_by" in item) || typeof item.shared_by !== "object" || item.shared_by === null || !("email" in item.shared_by) || typeof item.shared_by.email !== "string") throw new Error("The server returned invalid invitations.");
    return { id: item.id, listId: item.todo_list_id, listName: item.todo_list_name, email: item.email, sender: item.shared_by.email, status: item.status };
  });
}
