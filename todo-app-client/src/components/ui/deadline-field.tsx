import { Column, Switch } from "@expo/ui";
import { FormField } from "@/components/ui/form-field";
import { DeadlinePicker } from "@/components/ui/deadline-picker";

export function DeadlineField({ value, onChange, disabled }: { value: Date | null; onChange(value: Date | null): void; disabled: boolean }) {
  return (
    <Column spacing={8}>
      <FormField label="Deadline">
        <Switch value={value !== null} onValueChange={enabled => onChange(enabled ? new Date(Date.now() + 86_400_000) : null)} disabled={disabled} />
      </FormField>
      {value && <DeadlinePicker value={value} onChange={onChange} disabled={disabled} />}
    </Column>
  );
}
