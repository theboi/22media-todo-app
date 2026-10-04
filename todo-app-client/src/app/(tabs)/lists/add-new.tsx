import { Picker, TextInput } from "@expo/ui";
import { FormField } from "@/components/ui/form-field";
import { ColorField } from "@/components/ui/color-field";
import { SheetForm } from "@/components/ui/sheet-form";
import { randomUUID } from "expo-crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createList } from "@/lib/api/todo-lists";
import { useRouter } from "expo-router";

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

export default function AddNewListScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("droplet");
  const [color, setColor] = useState("#4C9AFF");
  const attempt = useRef<Parameters<typeof createList>[0] | null>(null);
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createList,
    networkMode: "always",
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["todo-lists"] }),
        queryClient.invalidateQueries({ queryKey: ["pinned-lists"] }),
      ]);
    },
  });
  const submit = () => {
    if (create.isPending || !name.trim()) return;
    if (
      !attempt.current ||
      attempt.current.name !== name.trim() ||
      attempt.current.color !== color ||
      attempt.current.icon !== icon ||
      attempt.current.description !== (description.trim() || null)
    )
      attempt.current = {
        id: randomUUID(),
        key: randomUUID(),
        name: name.trim(),
        color,
        icon,
        description: description.trim() || null,
      };
    create.mutate(attempt.current, { onSuccess: () => router.dismiss() });
  };

  return (
    <SheetForm
      error={create.error?.message}
      submitLabel={create.isPending ? "Creating…" : "Create List"}
      disabled={create.isPending || !name.trim()}
      pending={create.isPending}
      onSubmit={submit}
    >
      <FormField label="Name">
        <TextInput
          textAlign="right"
          placeholder="List name"
          autoCapitalize="sentences"
          maxLength={120}
          onChangeText={setName}
          editable={!create.isPending}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </FormField>
      <FormField label="Description"><TextInput placeholder="Optional" textAlign="right" maxLength={2000} onChangeText={setDescription} editable={!create.isPending} /></FormField>
      <FormField label="Icon">
        <Picker
          appearance="menu"
          selectedValue={icon}
          onValueChange={setIcon}
          enabled={!create.isPending}
        >
          {ICONS.map((item) => (
            <Picker.Item key={item.value} {...item} />
          ))}
        </Picker>
      </FormField>
      <ColorField value={color} onChange={setColor} disabled={create.isPending} />
    </SheetForm>
  );
}
