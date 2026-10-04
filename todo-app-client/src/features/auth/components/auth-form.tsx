import { Row, Text, TextInput } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SheetForm } from "@/components/ui/sheet-form";
import { FormField } from "@/components/ui/form-field";
import { recoverAccountQueries } from "@/lib/auth/query-recovery";
import { auth } from "@/lib/auth/session";

export function AuthForm({ signUp, onComplete, onSwitch }: { signUp: boolean; onComplete(): void; onSwitch(): void }) {
  const [confirmation, setConfirmation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const client = useQueryClient();
  const login = useMutation({
    networkMode: "always",
    mutationFn: async () => {
      await client.cancelQueries();
      return signUp ? auth.signUp(email, password, confirmation) : auth.signIn(email, password);
    },
    onSuccess: async session => {
      client.setQueryData(["auth", "session"], session);
      await Promise.all(["list", "todo", "todo-lists", "todos", "pinned-lists", "pending-shares", "list-shares"].map(key => client.resetQueries({ queryKey: [key] })));
      setPassword("");
    },
    onError: () => recoverAccountQueries(client),
  });
  const disabled = login.isPending || !email.trim() || password.length < 8 || (signUp && confirmation !== password);
  const submit = () => { if (!disabled) login.mutate(undefined, { onSuccess: onComplete }); };
  return <SheetForm error={login.error?.message} submitLabel={login.isPending ? "Please wait…" : signUp ? "Sign Up" : "Sign In"} disabled={disabled} pending={login.isPending} onSubmit={submit} onCancel={onComplete} footer={
    <Row spacing={8}>
      <Text>{signUp ? "Already have an account?" : "Don’t have an account?"}</Text>
      <Text onPress={() => { if (!login.isPending) onSwitch(); }} disabled={login.isPending} textStyle={{ fontWeight: "600" }}>{signUp ? "Sign In" : "Sign Up"}</Text>
    </Row>
  }>
    <FormField label="Email"><TextInput placeholder="you@example.com" textAlign="right" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} onChangeText={setEmail} editable={!login.isPending} maxLength={254} /></FormField>
    <FormField label="Password"><TextInput placeholder="Password" textAlign="right" secureTextEntry autoComplete={signUp ? "new-password" : "current-password"} autoCapitalize="none" autoCorrect={false} onChangeText={setPassword} editable={!login.isPending} maxLength={128} returnKeyType="go" onSubmitEditing={submit} /></FormField>
    {signUp && <FormField label="Confirm"><TextInput placeholder="Confirm password" textAlign="right" secureTextEntry autoComplete="new-password" autoCapitalize="none" autoCorrect={false} onChangeText={setConfirmation} editable={!login.isPending} maxLength={128} returnKeyType="go" onSubmitEditing={submit} /></FormField>}
  </SheetForm>;
}
