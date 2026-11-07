<script lang="ts">
  import { Text, View } from "nsh";

  let {
    title = "",
    description = "",
    class: className = "",
    children,
  } = $props<{
    title?: string;
    description?: string;
    class?: string;
    children?: any;
  }>();
</script>

<View class="rounded-xl border border-border bg-card p-5 shadow-sm {className}">
  {#if title || description}
    <View class="mb-4 gap-1">
      {#if title}
        <Text class="text-lg font-semibold text-card-foreground">{title}</Text>
      {/if}
      {#if description}
        <Text class="text-sm text-muted-foreground">{description}</Text>
      {/if}
    </View>
  {/if}
  {children}
</View>
