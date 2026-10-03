import {
  BottomSheet,
  Button,
  Column,
  Host,
  RNHostView,
  TextInput,
} from "@expo/ui";
import { sheetDismissModifiers } from "@/components/ui/sheet-modifiers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useTheme } from "expo-router";
import { auth } from "@/lib/auth/session";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

function SignInForm({ onComplete }: { onComplete(): void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const colors = useSurfaceColors();
  const { colors: theme } = useTheme();
  const { height, width } = useWindowDimensions();
  const login = useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      return auth.signIn(email, password);
    },
    onSuccess: async (session) => {
      queryClient.setQueryData(["auth", "session"], session);
      queryClient.removeQueries({ queryKey: ["list"] });
      await queryClient.resetQueries({ queryKey: ["todo-lists"] });
      setPassword("");
      onComplete();
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
      void queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
  return (
    <BottomSheet
      isPresented
      onDismiss={() => {
        if (!login.isPending) onComplete();
      }}
      snapPoints={["full"]}
      contentPadding={0}
      containerColor={colors.background}
      shouldDismissOnBackPress={!login.isPending}
      shouldDismissOnClickOutside={!login.isPending}
      modifiers={sheetDismissModifiers(login.isPending)}
    >
      <RNHostView matchContents>
        <View style={{ width, height: height * 0.85 }}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, gap: 20 }}
          >
            <Text
              accessibilityRole="header"
              style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}
            >
              Sign In
            </Text>
            <Text style={{ color: colors.secondaryText }}>
              Sign in to your email account. Your device lists will be replaced,
              not merged.
            </Text>
            <Text style={{ color: colors.text }}>Email</Text>
            <Host matchContents seedColor={theme.primary}>
              <TextInput
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEmail}
                editable={!login.isPending}
                maxLength={254}
              />
            </Host>
            <Text style={{ color: colors.text }}>Password</Text>
            <Host matchContents seedColor={theme.primary}>
              {/* On iOS this renders SwiftUI SecureField; Android uses native password masking. */}
              <TextInput
                placeholder="Password"
                secureTextEntry
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setPassword}
                editable={!login.isPending}
                maxLength={128}
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (email.trim() && password.length >= 8 && !login.isPending)
                    login.mutate();
                }}
              />
            </Host>
            {login.error && (
              <Text
                selectable
                accessibilityRole="alert"
                style={{ color: colors.text }}
              >
                {login.error.message}
              </Text>
            )}
            <Host matchContents seedColor={theme.primary}>
              <Column spacing={12}>
                <Button
                  label={login.isPending ? "Signing in…" : "Sign In"}
                  disabled={
                    login.isPending || !email.trim() || password.length < 8
                  }
                  onPress={() => login.mutate()}
                />
                <Button
                  label="Cancel"
                  variant="text"
                  disabled={login.isPending}
                  onPress={onComplete}
                />
              </Column>
            </Host>
          </ScrollView>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

export function SignInSheet({
  isPresented,
  onDismiss,
}: {
  isPresented: boolean;
  onDismiss(): void;
}) {
  return isPresented ? <SignInForm onComplete={onDismiss} /> : null;
}
