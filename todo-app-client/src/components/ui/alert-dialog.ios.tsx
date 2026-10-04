import { Host } from "@expo/ui";
import { Alert, Button, Text } from "@expo/ui/swift-ui";
import { useRef } from "react";
import type { AlertDialogProps } from "./alert-dialog";
export function AlertDialog({ title, message, confirmLabel, pending, error, onConfirm, onCancel }: AlertDialogProps) {
  const acted = useRef(false);
  return <Host matchContents><Alert title={title} isPresented={!pending} onIsPresentedChange={shown => { if (!shown && !acted.current) onCancel(); }}>
    <Alert.Trigger><Text> </Text></Alert.Trigger>
    <Alert.Message><Text>{error ?? message}</Text></Alert.Message>
    <Alert.Actions>
      <Button label="Cancel" role="cancel" onPress={() => { acted.current = true; onCancel(); }} />
      <Button label={confirmLabel} role="destructive" onPress={() => { acted.current = true; onConfirm(); }} />
    </Alert.Actions>
  </Alert></Host>;
}
