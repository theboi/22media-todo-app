import { Button, Column, Text, TextInput } from "@expo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef, useState } from "react";
import { SheetForm } from "@/components/ui/sheet-form";
import { FormField } from "@/components/ui/form-field";
import { auth } from "@/lib/auth/session";
import { fetchShares, revokeShare, shareList } from "@/lib/api/shares";
import type { TodoList } from "@/lib/api/lists";

export function ShareListForm({ list }: { list: TodoList }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const attempt = useRef<Parameters<typeof shareList>[0] | null>(null);
  const client = useQueryClient();
  const session = useQuery({ queryKey: ["auth", "session"], queryFn: () => auth.getSession(), retry: false });
  const canShare = Boolean(session.data?.email) && list.role === "owner";
  const shares = useQuery({ queryKey: ["list-shares", list.id, session.data?.accountId], queryFn: ({ signal }) => fetchShares(list.id, signal), enabled: canShare, retry: false });
  const send = useMutation({ mutationFn: shareList, networkMode: "always", onSuccess: async share => { setSent(share.email); await client.invalidateQueries({ queryKey: ["list-shares", list.id] }); } });
  const revoke = useMutation({ mutationFn: revokeShare, networkMode: "always", onSuccess: async () => { await client.invalidateQueries({ queryKey: ["list-shares", list.id] }); } });
  const submit = () => {
    const recipient = email.trim().toLowerCase();
    if (send.isPending || !canShare || !recipient) return;
    if (!attempt.current || attempt.current.email !== recipient) attempt.current = { listId: list.id, email: recipient, key: randomUUID() };
    send.mutate(attempt.current);
  };
  return <SheetForm error={send.error?.message ?? revoke.error?.message ?? shares.error?.message ?? session.error?.message} submitLabel={send.isPending ? "Sharing…" : "Share List"} disabled={!canShare || send.isPending || !email.trim()} pending={send.isPending} onSubmit={submit} fieldCount={2 + (shares.data?.length ?? 0)}>
    <FormField label="Email"><TextInput placeholder="friend@example.com" textAlign="right" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} onChangeText={value => { setEmail(value); setSent(null); }} editable={canShare && !send.isPending} returnKeyType="send" onSubmitEditing={submit} /></FormField>
    <Column spacing={8}>
      <Text>{session.isPending ? "Loading account…" : !session.data?.email ? "Sign in from Settings to share lists." : list.role !== "owner" ? "Only the list owner can share this list." : sent ? `Invitation ready for ${sent}. They can accept it in Lists.` : "Invite someone by email. They accept the invitation in Lists."}</Text>
      {shares.isPending && canShare ? <Text>Loading invitations…</Text> : null}
      {shares.error ? <Button variant="text" label="Retry invitations" onPress={() => void shares.refetch()} /> : null}
    </Column>
    {(shares.data ?? []).map(share => <FormField key={share.id} label={share.email}><Button variant="text" label={share.status === "accepted" ? "Revoke access" : "Cancel invite"} disabled={revoke.isPending} onPress={() => revoke.mutate({ listId: list.id, id: share.id, key: randomUUID() })} /></FormField>)}
  </SheetForm>;
}
