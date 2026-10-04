import { RNHostView } from "@expo/ui";
import { FormField } from "@/components/ui/form-field";

export function ColorField({ value, onChange, disabled }: { value: string; onChange(value: string): void; disabled: boolean }) {
  return (
    <FormField label="Color">
      <RNHostView matchContents>
        <input aria-label="List color" type="color" value={value} disabled={disabled} onChange={event => onChange(event.target.value.toUpperCase())} style={{ width: 44, height: 36, border: 0, padding: 0, background: "transparent" }} />
      </RNHostView>
    </FormField>
  );
}
