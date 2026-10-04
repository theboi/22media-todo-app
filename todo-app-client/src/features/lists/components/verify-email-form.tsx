import { Button, Column, Text, TextInput } from "@expo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useState } from "react";
import { SheetForm } from "@/components/ui/sheet-form";
import { FormField } from "@/components/ui/form-field";
import { requestVerification, confirmVerification } from "@/lib/api/shares";

export function VerifyEmailForm({ onVerified }: { onVerified(): void }) {
  const [code, setCode] = useState("");
  const client = useQueryClient();
  const request = useMutation({ mutationFn: () => requestVerification(randomUUID()), networkMode: "always" });
  const verify = useMutation({ mutationFn: () => confirmVerification({ code, key: randomUUID() }), networkMode: "always", onSuccess: async () => { await client.invalidateQueries({ queryKey: ["pending-shares"] }); onVerified(); } });
  return <SheetForm error={verify.error?.message ?? request.error?.message} submitLabel={verify.isPending ? "Verifying…" : "Verify Email"} disabled={verify.isPending || !/^\d{6}$/.test(code)} pending={verify.isPending} onSubmit={() => verify.mutate()}>
    <Column spacing={8}><Text>{request.isSuccess ? "Check your email for a six-digit code." : "Verify your email to receive shared lists."}</Text><Button label={request.isPending ? "Sending…" : "Send Verification Code"} disabled={request.isPending || verify.isPending} onPress={() => request.mutate()} /></Column>
    <FormField label="Code"><TextInput placeholder="123456" textAlign="right" keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} onChangeText={setCode} editable={!verify.isPending} /></FormField>
  </SheetForm>;
}
