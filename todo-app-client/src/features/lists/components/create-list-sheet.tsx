import { BottomSheet, FieldGroup, Picker, TextInput } from "@expo/ui";
import { SheetForm } from "@/components/ui/sheet-form";
import { sheetDismissModifiers } from "@/components/ui/sheet-modifiers";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createList } from "@/lib/api/todo-lists";
import { useSurfaceColors } from "@/hooks/use-surface-colors";

const COLORS = [
  { label: "Sky blue", value: "#4C9AFF" },
  { label: "Peach", value: "#FF8A65" },
  { label: "Lavender", value: "#B39DFF" },
  { label: "Mint", value: "#45CFA3" },
  { label: "Sunshine", value: "#F7C65E" },
  { label: "Rose", value: "#F781AE" },
];
const ICONS = [
  { label: "Water drop", value: "droplet" },
  { label: "Home", value: "home" },
  { label: "Work", value: "briefcase" },
  { label: "Book", value: "book" },
  { label: "Heart", value: "heart" },
  { label: "Shopping", value: "cart" },
  { label: "Star", value: "star" },
  { label: "Checkmark", value: "check" },
];
export function CreateListSheet({ onDismiss }: { onDismiss(): void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("droplet");
  const [color, setColor] = useState("#4C9AFF");
  const attempt = useRef<Parameters<typeof createList>[0] | null>(null);
  const colors = useSurfaceColors();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createList,
    networkMode: "always",
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["todo-lists"] }),
        queryClient.invalidateQueries({ queryKey: ["pinned-lists"] }),
      ]);
      onDismiss();
    },
  });
  const submit = () => {
    if (create.isPending || !name.trim()) return;
    if (
      !attempt.current ||
      attempt.current.name !== name.trim() ||
      attempt.current.color !== color ||
      attempt.current.icon !== icon
    )
      attempt.current = {
        id: randomUUID(),
        key: randomUUID(),
        name: name.trim(),
        color,
        icon,
      };
    create.mutate(attempt.current);
  };
  return (
    <BottomSheet
      isPresented
      onDismiss={() => {
        if (!create.isPending) onDismiss();
      }}
      shouldDismissOnBackPress={!create.isPending}
      shouldDismissOnClickOutside={!create.isPending}
      modifiers={sheetDismissModifiers(create.isPending)}
      snapPoints={["full"]}
      containerColor={colors.background}
    >
      <SheetForm
        title="New List"
        error={create.error?.message}
        submitLabel={create.isPending ? "Creating…" : "Create List"}
        disabled={create.isPending || !name.trim()}
        pending={create.isPending}
        onSubmit={submit}
        onCancel={onDismiss}
      >
        <FieldGroup.Section title="List name">
          <TextInput
            placeholder="List name"
            autoCapitalize="sentences"
            maxLength={120}
            onChangeText={setName}
            editable={!create.isPending}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </FieldGroup.Section>
        <FieldGroup.Section title="Icon">
          <Picker appearance="menu" selectedValue={icon} onValueChange={setIcon} enabled={!create.isPending}>
            {ICONS.map((item) => <Picker.Item key={item.value} {...item} />)}
          </Picker>
        </FieldGroup.Section>
        <FieldGroup.Section title="Color">
          <Picker appearance="menu" selectedValue={color} onValueChange={setColor} enabled={!create.isPending}>
            {COLORS.map((item) => <Picker.Item key={item.value} {...item} />)}
          </Picker>
        </FieldGroup.Section>
      </SheetForm>
    </BottomSheet>
  );
}
