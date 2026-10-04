import { apiRequest } from "./todo-lists";
import { readShares } from "./share-resources";
import { readLists } from "./lists";

export const fetchShares = async (listId: string, signal: AbortSignal) => readShares(await apiRequest(`/todo-lists/${encodeURIComponent(listId)}/shares`, signal));
export const fetchPendingShares = async (signal: AbortSignal) => readShares(await apiRequest("/shares/pending", signal));
export const shareList = async ({ listId, email, key }: { listId: string; email: string; key: string }) => readShares([await apiRequest(`/todo-lists/${encodeURIComponent(listId)}/shares`, undefined, { email }, { method: "POST", key })])[0];
export const acceptShare = async ({ id, key }: { id: string; key: string }) => readLists([await apiRequest(`/shares/${encodeURIComponent(id)}/accept`, undefined, undefined, { method: "POST", key })])[0];
export const declineShare = async ({ id, key }: { id: string; key: string }) => { await apiRequest(`/shares/${encodeURIComponent(id)}/decline`, undefined, undefined, { method: "POST", key }); };
export const revokeShare = async ({ listId, id, key }: { listId: string; id: string; key: string }) => { await apiRequest(`/todo-lists/${encodeURIComponent(listId)}/shares/${encodeURIComponent(id)}`, undefined, undefined, { method: "DELETE", key }); };
export const requestVerification = async (key: string) => { await apiRequest("/auth/email-verification/request", undefined, undefined, { method: "POST", key }); };
export const confirmVerification = async ({ code, key }: { code: string; key: string }) => { await apiRequest("/auth/email-verification/confirm", undefined, { code }, { method: "POST", key }); };
