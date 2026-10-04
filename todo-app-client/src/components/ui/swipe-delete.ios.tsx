import { SwipeActions, Button } from "@expo/ui/swift-ui";
import { disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";
export function SwipeDelete({ children, onDelete, disabled }: { children: React.ReactNode; onDelete(): void; disabled: boolean }) {
  return <SwipeActions>
    {children}
    <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
      <Button label="Delete" systemImage="trash" role="destructive" onPress={onDelete} modifiers={[disabledModifier(disabled)]} />
    </SwipeActions.Actions>
  </SwipeActions>;
}
