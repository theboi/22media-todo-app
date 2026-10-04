import { Row, Spacer, Text } from "@expo/ui";

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Row alignment="center" spacing={12} style={{ paddingVertical: 8 }}>
      <Text>{label}</Text>
      <Spacer flexible />
      {children}
    </Row>
  );
}
