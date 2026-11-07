<script>
  import { Text, View } from "nsh";
  import { Button } from "nsh/base";
  import { goto } from "$app/navigation";

  const features = [
    { title: "Svelte 5 Runes", desc: "$state, $derived, $effect compile directly into native signals" },
    { title: "No Virtual DOM", desc: "Templates compile to element, prop, and append instructions" },
    { title: "Multi-Platform Native Views", desc: "UIKit, Android Views, AppKit, Win32, GTK 4, GPUI" },
    { title: "SvelteKit Filesystem Routing", desc: "src/routes with layouts, dynamic segments, and client load" },
  ];
</script>

<View class="flex-1 gap-6 p-4">
  <View class="gap-1">
    <Text class="text-2xl font-bold text-foreground">Explore Architecture</Text>
    <Text class="text-sm text-muted-foreground">What makes NativeSvelte unique</Text>
  </View>

  <View class="gap-3">
    {#each features as feat}
      <View class="bg-card border border-border rounded-xl p-4 gap-1">
        <Text class="font-bold text-base text-foreground">{feat.title}</Text>
        <Text class="text-sm text-muted-foreground">{feat.desc}</Text>
      </View>
    {/each}
  </View>

  <Button
    onPress={() => goto("/")}
    class="self-start bg-primary px-5 py-2.5 rounded-xl active:opacity-75 mt-2"
  >
    <Text class="text-primary-foreground font-semibold">← Return Home</Text>
  </Button>
</View>
