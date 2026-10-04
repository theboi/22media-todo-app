import { RNHostView } from "@expo/ui";

export function DeadlinePicker({ value, onChange, disabled }: { value: Date; onChange(value: Date): void; disabled: boolean }) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  return (
    <RNHostView matchContents>
      <input aria-label="Todo deadline" type="datetime-local" value={local} disabled={disabled} onChange={event => { const date = new Date(event.target.value); if (Number.isFinite(date.getTime())) onChange(date); }} />
    </RNHostView>
  );
}
