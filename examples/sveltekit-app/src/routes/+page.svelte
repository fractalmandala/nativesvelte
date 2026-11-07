<script>
  import { Text, View } from "nsh";
  import { Button } from "nsh/base";
  import { goto } from "$app/navigation";

  let taps = $state(0);
</script>

<View class="flex-1 gap-6 items-center justify-center p-6">
  <View class="items-center gap-2">
    <Text class="text-3xl font-extrabold text-foreground">Welcome to SvelteKit Native</Text>
    <Text class="text-base text-muted-foreground">Zero virtual DOM • File-based routing • Svelte 5 Runes</Text>
  </View>

  <View class="bg-card border border-border rounded-2xl p-6 items-center gap-3 w-full max-w-sm shadow-sm">
    <Text class="text-sm text-muted-foreground font-medium">Reactive Rune Demo</Text>
    <Text class="text-5xl font-black text-primary">{taps}</Text>
    <Button
      onPress={() => taps++}
      class="bg-primary px-6 py-2.5 rounded-xl active:opacity-75"
    >
      <Text class="text-primary-foreground font-bold text-base">Tap Count</Text>
    </Button>
  </View>

  <View class="flex-row gap-4 mt-2">
    <Button
      onPress={() => goto("/explore")}
      class="border border-input bg-background px-5 py-2.5 rounded-xl active:bg-muted"
    >
      <Text class="text-foreground font-semibold">Explore Features</Text>
    </Button>
    <Button
      onPress={() => goto("/tasks/42")}
      class="bg-secondary px-5 py-2.5 rounded-xl active:opacity-75"
    >
      <Text class="text-secondary-foreground font-semibold">Open Task #42</Text>
    </Button>
  </View>
</View>
