import { Button, Row, Text, TextInput, useNativeState } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { SheetForm } from "@/components/ui/sheet-form";
import { FormField } from "@/components/ui/form-field";
import { recoverAccountQueries } from "@/lib/auth/query-recovery";
import { auth } from "@/lib/auth/session";
import { validateCredentials, type Credentials } from "@/lib/auth/credentials";

export function AuthForm({ signUp, onComplete, onSwitch }: { signUp: boolean; onComplete(): void; onSwitch(): void }) {
  const confirmation = useNativeState("");
  const email = useNativeState("");
  const password = useNativeState("");
  const [validationError, setValidationError] = useState<string>();
  const submitting = useRef(false);
  const client = useQueryClient();
  const login = useMutation({
    networkMode: "always",
    mutationFn: async (credentials: Credentials) => {
      await client.cancelQueries();
      return signUp ? auth.signUp(credentials.email, credentials.password, credentials.confirmation) : auth.signIn(credentials.email, credentials.password);
    },
    onSuccess: async session => {
      client.setQueryData(["auth", "session"], session);
      await Promise.all(["list", "todo", "todo-lists", "todos", "pinned-lists", "pending-shares", "list-shares"].map(key => client.resetQueries({ queryKey: [key] })));
    },
    onError: () => recoverAccountQueries(client),
    onSettled: () => { submitting.current = false; },
  });
  const clearError = () => { setValidationError(undefined); if (login.isError) login.reset(); };
  const submit = () => {
    if (submitting.current) return;
    const credentials = { email: email.get(), password: password.get(), confirmation: confirmation.get() };
    const error = validateCredentials(credentials, signUp);
    setValidationError(error);
    if (error) { login.reset(); return; }
    submitting.current = true;
    login.mutate(credentials, { onSuccess: onComplete });
  };
  return <SheetForm error={validationError ?? login.error?.message} fieldCount={signUp ? 3 : 2} submitLabel={login.isPending ? "Please wait…" : signUp ? "Sign Up" : "Sign In"} disabled={login.isPending} pending={login.isPending} onSubmit={submit} onCancel={onComplete} footer={
    <Row spacing={8}>
      <Text>{signUp ? "Already have an account?" : "Don’t have an account?"}</Text>
      <Button variant="text" label={signUp ? "Sign In" : "Sign Up"} onPress={onSwitch} disabled={login.isPending} />
    </Row>
  }>
    <FormField label="Email"><TextInput value={email} placeholder="you@example.com" textAlign="right" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} onChangeText={clearError} editable={!login.isPending} maxLength={254} /></FormField>
    <FormField label="Password"><TextInput value={password} placeholder="8+ characters" textAlign="right" secureTextEntry autoComplete={signUp ? "new-password" : "current-password"} autoCapitalize="none" autoCorrect={false} onChangeText={clearError} editable={!login.isPending} maxLength={128} returnKeyType="go" onSubmitEditing={submit} /></FormField>
    {signUp && <FormField label="Confirm"><TextInput value={confirmation} placeholder="Confirm password" textAlign="right" secureTextEntry autoComplete="new-password" autoCapitalize="none" autoCorrect={false} onChangeText={clearError} editable={!login.isPending} maxLength={128} returnKeyType="go" onSubmitEditing={submit} /></FormField>}
  </SheetForm>;
}
