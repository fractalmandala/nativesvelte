<script>
  import { Text, View } from "nsh";
  import { Button } from "nsh/base";
  import { goto } from "$app/navigation";
</script>

<View class="flex-1 gap-6 p-4">
  <View class="gap-1">
    <Text class="text-2xl font-bold text-foreground">About NativeSvelte</Text>
    <Text class="text-sm text-muted-foreground">The reactive native framework powered by Svelte 5 and Rust</Text>
  </View>

  <View class="bg-card border border-border rounded-xl p-5 gap-3">
    <Text class="text-base text-foreground">
      NativeSvelte is forked from and extends NativeShell (NSH) by Longbridge. It brings Svelte 5's fine-grained reactive runes ($state, $derived, $effect, $props) and SvelteKit file-based routing to high-performance platform views.
    </Text>
    <Text class="text-sm text-muted-foreground">
      Licensed under Apache 2.0 with full attribution to original authors and NativeSvelte contributors.
    </Text>
  </View>

  <Button
    onPress={() => goto("/")}
    class="self-start bg-primary px-5 py-2.5 rounded-xl active:opacity-75"
  >
    <Text class="text-primary-foreground font-semibold">← Back to Home</Text>
  </Button>
</View>
