export type TodoList = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  role: "owner" | "member";
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const record = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value))
    throw new Error("The server returned an invalid response.");
  return value;
};
export const request = async (
  url: string,
  path: string,
  token: string | null,
  signal: AbortSignal,
  body?: object,
  operation?: { method: "POST" | "PATCH" | "DELETE"; key: string },
): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(`${url}${path}`, {
      method: operation?.method ?? (body ? "POST" : "GET"),
      signal,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(operation ? { "Idempotency-Key": operation.key } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Cannot reach Eves. Check your connection and try again.");
  }
  if (response.status === 204) return undefined;
  const payload: unknown = await response.json();
  const data = record(payload);
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Your session is no longer valid."
        : response.status === 404
          ? "This list was deleted or is no longer available."
          : operation
            ? "Could not save your change. Please try again."
            : "Could not load your lists. Please try again.",
    );
  return data.data;
};
export const readLists = (value: unknown): TodoList[] => {
  if (!Array.isArray(value))
    throw new Error("The server returned invalid lists.");
  return value.map((item) => {
    const data = record(item);
    if (
      typeof data.id !== "string" ||
      typeof data.name !== "string" ||
      !(data.description === null || typeof data.description === "string") ||
      typeof data.icon !== "string" ||
      typeof data.color !== "string" ||
      !/^#[0-9A-Fa-f]{6}$/.test(data.color) ||
      (data.role !== "owner" && data.role !== "member")
    )
      throw new Error("The server returned an invalid list.");
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      role: data.role,
    };
  });
};
