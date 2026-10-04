import { Button, RNHostView } from "@expo/ui";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useState } from "react";
import { View } from "react-native";

export function DeadlinePicker({ value, onChange, disabled }: { value: Date; onChange(value: Date): void; disabled: boolean }) {
  const [mode, setMode] = useState<"date" | "time" | null>(null);
  return (
    <>
      <Button variant="text" label={value.toLocaleString()} disabled={disabled} onPress={() => setMode("date")} />
      {mode && <RNHostView matchContents><View><DateTimePicker value={value} mode={mode} onChange={(event, date) => {
        if (event.type !== "set" || !date) { setMode(null); return; }
        onChange(date);
        setMode(mode === "date" ? "time" : null);
      }} /></View></RNHostView>}
    </>
  );
}
