<script>
  import { Text, View } from "nsh";
  import { Button } from "nsh/base";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
</script>

<View class="flex-1 bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
  <!-- Top Navigation Bar -->
  <View class="flex-row items-center justify-between border-b border-border px-4 py-3 bg-card">
    <View class="flex-row items-center gap-2">
      <Text class="font-bold text-lg text-primary">NativeSvelteKit</Text>
    </View>
    <View class="flex-row items-center gap-2">
      <Button onPress={() => goto("/")} class="px-3 py-1.5 rounded-lg active:bg-muted">
        <Text class="{page.url.pathname === '/' ? 'text-primary font-bold' : 'text-muted-foreground'}">Home</Text>
      </Button>
      <Button onPress={() => goto("/explore")} class="px-3 py-1.5 rounded-lg active:bg-muted">
        <Text class="{page.url.pathname === '/explore' ? 'text-primary font-bold' : 'text-muted-foreground'}">Explore</Text>
      </Button>
      <Button onPress={() => goto("/tasks/1")} class="px-3 py-1.5 rounded-lg active:bg-muted">
        <Text class="{page.url.pathname.startsWith('/tasks') ? 'text-primary font-bold' : 'text-muted-foreground'}">Task #1</Text>
      </Button>
      <Button onPress={() => goto("/about")} class="px-3 py-1.5 rounded-lg active:bg-muted">
        <Text class="{page.url.pathname === '/about' ? 'text-primary font-bold' : 'text-muted-foreground'}">About</Text>
      </Button>
    </View>
  </View>

  <!-- Route Content View -->
  <View class="flex-1 p-4">
    <slot />
  </View>
</View>
