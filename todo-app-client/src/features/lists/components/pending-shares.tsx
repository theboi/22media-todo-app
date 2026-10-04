import { Button, Column, Host, Row, Text } from "@expo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { View } from "react-native";
import { auth } from "@/lib/auth/session";
import { acceptShare, declineShare, fetchPendingShares } from "@/lib/api/shares";
import { ApiRequestError } from "@/lib/api/lists";
import type { ListShare } from "@/lib/api/share-resources";

function Invitation({ share, onVerify }: { share: ListShare; onVerify(): void }) {
  const client = useQueryClient();
  const act = useMutation({ mutationFn: async ({ accept }: { accept: boolean }) => {
    const input = { id: share.id, key: randomUUID() };
    return accept ? acceptShare(input) : declineShare(input);
  }, networkMode: "always", onSuccess: async () => {
    await Promise.all([client.invalidateQueries({ queryKey: ["pending-shares"] }), client.invalidateQueries({ queryKey: ["todo-lists"] })]);
  } });
  return <Column spacing={8}>
    <Text textStyle={{ fontWeight: "600" }}>{share.listName}</Text>
    <Text>{`From ${share.sender}`}</Text>
    <Row spacing={12}>
      <Button label="Accept" disabled={act.isPending} onPress={() => act.mutate({ accept: true })} />
      <Button label="Decline" variant="text" disabled={act.isPending} onPress={() => act.mutate({ accept: false })} />
    </Row>
    {act.error ? <Text>{act.error.message}</Text> : null}
    {act.error instanceof ApiRequestError && act.error.code === "EMAIL_NOT_VERIFIED" ? <Button label="Verify Email" variant="text" onPress={onVerify} /> : null}
  </Column>;
}

export function PendingShares({ onVerify }: { onVerify(): void }) {
  const session = useQuery({ queryKey: ["auth", "session"], queryFn: () => auth.getSession(), retry: false });
  const query = useQuery({ queryKey: ["pending-shares", session.data?.accountId], queryFn: ({ signal }) => fetchPendingShares(signal), enabled: Boolean(session.data?.email), retry: false });
  if (!session.data?.email) return null;
  if (!query.error && !query.isPending && !query.data?.length) return null;
  return <View style={{ padding: 16 }}><Host matchContents><Column spacing={16}>
    <Text textStyle={{ fontWeight: "700", fontSize: 20 }}>Invitations</Text>
    {query.isPending ? <Text>Loading invitations…</Text> : null}
    {query.error ? <><Text>{query.error.message}</Text><Button label="Retry" variant="text" onPress={() => void query.refetch()} /></> : null}
    {(query.data ?? []).map(share => <Invitation key={share.id} share={share} onVerify={onVerify} />)}
  </Column></Host></View>;
}
