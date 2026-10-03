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
import { recoverAccountQueries } from "@/lib/auth/query-recovery";
import { auth } from "@/lib/auth/session";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

function SignInForm({ onComplete }: { onComplete(): void }) {
  const [signUp, setSignUp] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const colors = useSurfaceColors();
  const { colors: theme } = useTheme();
  const { height, width } = useWindowDimensions();
  const login = useMutation({
    networkMode: "always",
    mutationFn: async () => {
      await queryClient.cancelQueries();
      return signUp
        ? auth.signUp(email, password, confirmation)
        : auth.signIn(email, password);
    },
    onSuccess: async (session) => {
      queryClient.setQueryData(["auth", "session"], session);

      await Promise.all([
        queryClient.resetQueries({ queryKey: ["list"] }),
        queryClient.resetQueries({ queryKey: ["todo-lists"] }),
        queryClient.resetQueries({ queryKey: ["todos"] }),
        queryClient.resetQueries({ queryKey: ["pinned-lists"] }),
      ]);
      setPassword("");
      onComplete();
    },
    onError: () => recoverAccountQueries(queryClient),
  });
  let submitLabel = signUp ? "Sign Up" : "Sign In";
  if (login.isPending) submitLabel = "Please wait…";
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
              {signUp ? "Sign Up" : "Sign In"}
            </Text>
            <Text style={{ color: colors.secondaryText }}>
              {signUp
                ? "Create an email account and keep your device lists."
                : "Sign in to your email account. Your device lists will be replaced, not merged."}
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
            <Host
              key={signUp ? "signup-password" : "signin-password"}
              matchContents
              seedColor={theme.primary}
            >
              {/* On iOS this renders SwiftUI SecureField; Android uses native password masking. */}
              <TextInput
                placeholder="Password"
                secureTextEntry
                autoComplete={signUp ? "new-password" : "current-password"}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setPassword}
                editable={!login.isPending}
                maxLength={128}
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (
                    email.trim() &&
                    password.length >= 8 &&
                    (!signUp || confirmation === password) &&
                    !login.isPending
                  )
                    login.mutate();
                }}
              />
            </Host>
            {signUp && (
              <>
                <Text style={{ color: colors.text }}>Confirm password</Text>
                <Host matchContents>
                  <TextInput
                    placeholder="Confirm password"
                    secureTextEntry
                    autoComplete="new-password"
                    onChangeText={setConfirmation}
                    editable={!login.isPending}
                    maxLength={128}
                  />
                </Host>
              </>
            )}
            {login.error && (
              <Text
                selectable
                accessibilityRole="alert"
                style={{ color: colors.text }}
              >
                {login.error.message}
              </Text>
            )}
            <View
              style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}
            >
              <Text style={{ color: colors.text }}>
                {signUp ? "Already have an account?" : "Don’t have an account?"}
              </Text>
              <Text
                accessibilityRole="button"
                accessibilityState={{ disabled: login.isPending }}
                onPress={() => {
                  if (!login.isPending) {
                    setSignUp(!signUp);
                    setPassword("");
                    setConfirmation("");
                    login.reset();
                  }
                }}
                style={{
                  color: theme.primary,
                  textDecorationLine: "underline",
                }}
              >
                {signUp ? "Sign In" : "Sign Up"}
              </Text>
            </View>
            <Host matchContents seedColor={theme.primary}>
              <Column spacing={12}>
                <Button
                  label={submitLabel}
                  disabled={
                    login.isPending ||
                    !email.trim() ||
                    password.length < 8 ||
                    (signUp && confirmation !== password)
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
