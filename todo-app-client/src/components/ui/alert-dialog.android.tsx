import { Host } from "@expo/ui";
import { AlertDialog as NativeAlertDialog, Button, Text } from "@expo/ui/jetpack-compose";
import type { AlertDialogProps } from "./alert-dialog";
export function AlertDialog({ title, message, confirmLabel, pending, error, onConfirm, onCancel }: AlertDialogProps) {
  return <Host matchContents><NativeAlertDialog onDismissRequest={() => { if (!pending) onCancel(); }}>
    <NativeAlertDialog.Title><Text>{title}</Text></NativeAlertDialog.Title>
    <NativeAlertDialog.Text><Text>{error ?? message}</Text></NativeAlertDialog.Text>
    <NativeAlertDialog.ConfirmButton><Button onClick={onConfirm} enabled={!pending}><Text>{pending ? "Deleting…" : confirmLabel}</Text></Button></NativeAlertDialog.ConfirmButton>
    <NativeAlertDialog.DismissButton><Button onClick={onCancel} enabled={!pending}><Text>Cancel</Text></Button></NativeAlertDialog.DismissButton>
  </NativeAlertDialog></Host>;
}
