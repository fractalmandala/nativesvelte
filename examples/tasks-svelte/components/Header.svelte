<script>
  import { Text, View } from "nsh";
  import { Button } from "nsh/base";
  import { nav } from "../nav";

  let { title = "" } = $props();
</script>

<View class="flex-row items-center gap-3 border-b border-border p-3">
  {#if nav.routes().length > 1}
    <Button onPress={() => nav.pop()} class="active:opacity-60">
      <Text class="text-primary">Back</Text>
    </Button>
  {/if}
  <Text class="font-semibold text-foreground">{title}</Text>
</View>
