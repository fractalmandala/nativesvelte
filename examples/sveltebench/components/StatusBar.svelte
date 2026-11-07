<script lang="ts">
  import { platform, Text, View } from "nsh";
</script>

<View class="h-6 border-t border-border bg-card px-3 flex-row items-center justify-between text-xs select-none">
  <!-- Status Left -->
  <View class="flex-row items-center gap-3">
    <View class="flex-row items-center gap-1.5">
      <Text class="text-[11px]">🌿</Text>
      <Text class="text-[11px] font-mono text-muted-foreground">main</Text>
    </View>
    <View class="flex-row items-center gap-1">
      <Text class="text-[11px] text-emerald-500">✓</Text>
      <Text class="text-[11px] text-muted-foreground">0 errors, 0 warnings</Text>
    </View>
  </View>

  <!-- Status Right (Native Telemetry) -->
  <View class="flex-row items-center gap-4">
    <View class="flex-row items-center gap-1">
      <Text class="text-[10px] text-muted-foreground font-mono">RAM:</Text>
      <Text class="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">28.4 MB</Text>
    </View>

    <View class="flex-row items-center gap-1">
      <Text class="text-[10px] text-muted-foreground font-mono">FPS:</Text>
      <Text class="text-[11px] font-mono font-bold text-primary">120 Hz</Text>
    </View>

    <View class="flex-row items-center gap-1">
      <Text class="text-[10px] text-muted-foreground font-mono">Platform:</Text>
      <Text class="text-[11px] font-mono text-foreground">{platform.os} ({platform.idiom})</Text>
    </View>

    <View class="flex-row items-center gap-1">
      <Text class="text-[10px] text-muted-foreground font-mono">Engine:</Text>
      <Text class="text-[11px] font-mono font-semibold text-primary">Svelte 5 + Rust</Text>
    </View>
  </View>
</View>
