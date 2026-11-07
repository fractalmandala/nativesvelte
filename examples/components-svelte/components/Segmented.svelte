<script lang="ts">
  import { Text, View } from "nsh";

  type Option = { value: string; label: string };

  let {
    options = [],
    value = "",
    onChange,
    class: className = "",
  } = $props<{
    options?: Option[];
    value?: string;
    onChange?: (val: string) => void;
    class?: string;
  }>();

  const itemOf = (o: any): Option => (typeof o === "function" ? o() : o);
</script>

<View class="flex-row rounded-lg bg-muted p-1 gap-1 {className}">
  {#each options as opt}
    <View
      role="button"
      onPress={() => onChange?.(itemOf(opt).value)}
      class="flex-1 items-center justify-center rounded-md py-1.5 px-3 transition {itemOf(opt).value === value ? 'bg-background shadow-xs' : 'bg-transparent active:opacity-70'}"
    >
      <Text class="text-xs font-medium {itemOf(opt).value === value ? 'text-foreground font-semibold' : 'text-muted-foreground'}">
        {itemOf(opt).label}
      </Text>
    </View>
  {/each}
</View>
