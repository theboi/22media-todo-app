import { BottomSheet, Button, Column, Picker, TextInput, Text } from "@expo/ui";
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
export function CreateListSheet({ onDismiss }: { onDismiss(): void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4C9AFF");
  const attempt = useRef<Parameters<typeof createList>[0] | null>(null);
  const colors = useSurfaceColors();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createList,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
      onDismiss();
    },
  });
  const submit = () => {
    if (create.isPending || !name.trim()) return;
    if (
      !attempt.current ||
      attempt.current.name !== name.trim() ||
      attempt.current.color !== color
    )
      attempt.current = {
        id: randomUUID(),
        key: randomUUID(),
        name: name.trim(),
        color,
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
      snapPoints={["half", "full"]}
      containerColor={colors.background}
    >
      <Column spacing={20} style={{ padding: 24 }}>
        <Text textStyle={{ fontSize: 24, fontWeight: "bold" }}>New List</Text>
        <TextInput
          placeholder="List name"
          autoCapitalize="sentences"
          maxLength={120}
          onChangeText={setName}
          editable={!create.isPending}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Text>Color</Text>
        <Picker
          selectedValue={color}
          onValueChange={setColor}
          enabled={!create.isPending}
        >
          {COLORS.map((item) => (
            <Picker.Item key={item.value} {...item} />
          ))}
        </Picker>
        {create.error && <Text>{create.error.message}</Text>}
        <Button
          label={create.isPending ? "Creating…" : "Create List"}
          disabled={create.isPending || !name.trim()}
          onPress={submit}
        />
        <Button
          label="Cancel"
          variant="text"
          disabled={create.isPending}
          onPress={onDismiss}
        />
      </Column>
    </BottomSheet>
  );
}
