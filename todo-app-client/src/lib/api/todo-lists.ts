import { readLists, request } from "./lists";
import { API_URL } from "./config";
import { auth } from "@/lib/auth/session";
import { readListDetail } from "./list-detail";

export const apiRequest = async (
  path: string,
  signal?: AbortSignal,
  body?: object,
  operation?: { method: "POST" | "PATCH" | "DELETE"; key: string },
) => {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(cancel, 15_000);
  try {
    const token = await auth.getToken();
    if (controller.signal.aborted)
      throw new Error("The request timed out. Please try again.");
    return await request(
      API_URL,
      path,
      token,
      controller.signal,
      body,
      operation,
    );
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted)
      throw new Error("The request timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
};
export const fetchLists = async (signal: AbortSignal) =>
  readLists(await apiRequest("/todo-lists", signal));
export const createList = async (input: {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string | null;
  key: string;
}) => {
  const { key, ...body } = input;
  const [list] = readLists([
    await apiRequest("/todo-lists", undefined, body, { method: "POST", key }),
  ]);
  if (!list) throw new Error("The server returned an invalid list.");
  return list;
};
export const deleteList = async ({ id, key }: { id: string; key: string }) => {
  await apiRequest(
    `/todo-lists/${encodeURIComponent(id)}`,
    undefined,
    undefined,
    { method: "DELETE", key },
  );
};
export const fetchList = async (id: string, signal: AbortSignal) =>
  readListDetail(
    await apiRequest(`/todo-lists/${encodeURIComponent(id)}`, signal),
  );

export const updateList = async ({ id, key, ...body }: { id: string; key: string; name?: string; description?: string | null }) => {
  const [list] = readLists([await apiRequest(`/todo-lists/${encodeURIComponent(id)}`, undefined, body, { method: "PATCH", key })]);
  if (!list) throw new Error("The server returned an invalid list.");
  return list;
};
