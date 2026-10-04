import { FieldGroup, Host, List, ListItem, Text } from "@expo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/lib/auth/session";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useSurfaceColors();
  const queryClient = useQueryClient();
  const { data: session, error, refetch } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => auth.getSession(),
    retry: false,
  });
  const logout = useMutation({
    networkMode: "always",
    mutationFn: async () => {
      await queryClient.cancelQueries();
      return auth.signOut();
    },
    onSettled: async () => {
      // Reset data even when fresh-guest provisioning fails after logout.
      await Promise.all([
        queryClient.resetQueries({ queryKey: ["auth", "session"] }),
        queryClient.resetQueries({ queryKey: ["list"] }),
        queryClient.resetQueries({ queryKey: ["todo-lists"] }),
        queryClient.resetQueries({ queryKey: ["todos"] }),
        queryClient.resetQueries({ queryKey: ["pinned-lists"] }),
        queryClient.resetQueries({ queryKey: ["todo"] }),
        queryClient.resetQueries({ queryKey: ["pending-shares"] }),
        queryClient.resetQueries({ queryKey: ["list-shares"] }),
      ]);
    },
  });
  let accountLabel = "Loading account…";
  if (session) accountLabel = session.email ?? "Guest Account";
  else if (error) accountLabel = "Account unavailable";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Host style={{ flex: 1 }}>
        <List>
          <ListItem
            supportingText={error ? "Could not load account. Tap to retry." : undefined}
            onPress={error ? () => void refetch() : undefined}
          >
            <Text>{accountLabel}</Text>
          </ListItem>
          {session && (
            <FieldGroup.Section>
              {session.email ? (
                <ListItem onPress={logout.isPending ? undefined : () => logout.mutate()}>
                  <Text>{logout.isPending ? "Signing out…" : "Sign Out"}</Text>
                </ListItem>
              ) : (
                <ListItem onPress={logout.isPending ? undefined : () => router.push("/settings/sign-in")}>
                  <Text>Sign In</Text>
                </ListItem>
              )}
            </FieldGroup.Section>
          )}
          {logout.error && <ListItem><Text>{logout.error.message}</Text></ListItem>}
        </List>
      </Host>
    </View>
  );
}
