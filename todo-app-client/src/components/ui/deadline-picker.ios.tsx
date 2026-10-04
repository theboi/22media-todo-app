import { DatePicker } from "@expo/ui/swift-ui";
import { datePickerStyle, disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";

export function DeadlinePicker({ value, onChange, disabled }: { value: Date; onChange(value: Date): void; disabled: boolean }) {
  return <DatePicker title="Due" selection={value} displayedComponents={["date", "hourAndMinute"]} onDateChange={onChange} modifiers={[datePickerStyle("compact"), disabledModifier(disabled)]} />;
}
