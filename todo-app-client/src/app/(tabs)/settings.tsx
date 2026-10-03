import { Host, List, ListItem, Text } from "@expo/ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { SignInSheet } from "@/features/auth/components/sign-in-sheet";
import { auth } from "@/lib/auth/session";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

export default function SettingsScreen() {
  const [isPresented, setIsPresented] = useState(false);
  const colors = useSurfaceColors();
  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => auth.getSession(),
    retry: false,
  });
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Host style={{ flex: 1 }}>
        <List>
          <ListItem
            onPress={session?.email ? undefined : () => setIsPresented(true)}
          >
            <Text>{session?.email ? "Signed In" : "Sign In"}</Text>
          </ListItem>
        </List>
      </Host>
      <SignInSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
      />
    </View>
  );
}
