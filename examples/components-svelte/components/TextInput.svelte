<script lang="ts">
  import { Text, View } from "nsh";
  import { Input } from "nsh/base";

  let {
    label = "",
    placeholder = "",
    value = "",
    onChange,
    testID = "",
    error = "",
    class: className = "",
  } = $props<{
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
    testID?: string;
    error?: string;
    class?: string;
  }>();

  function handleInput(e: any) {
    const val = typeof e === "string" ? e : e?.value ?? "";
    if (onChange) {
      onChange(val);
    }
  }
</script>

<View class="gap-1.5 {className}">
  {#if label}
    <Text class="text-sm font-medium text-foreground">{label}</Text>
  {/if}
  <Input
    testID={testID}
    placeholder={placeholder}
    value={value}
    onChange={handleInput}
    class="h-10 rounded-lg border px-3 text-sm text-foreground bg-background {error ? 'border-destructive' : 'border-input'}"
  />
  {#if error}
    <Text class="text-xs text-destructive">{error}</Text>
  {/if}
</View>
