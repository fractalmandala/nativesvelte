<script lang="ts">
  import { Text, View } from "nsh";

  let {
    label = "",
    variant = "default",
    class: className = "",
  } = $props<{
    label?: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "success";
    class?: string;
  }>();

  const variantClasses: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-white",
    outline: "border border-border text-foreground",
    success: "bg-emerald-600 text-white",
  };
</script>

<View class="self-start rounded-full px-2.5 py-0.5 {variantClasses[variant] || variantClasses.default} {className}">
  <Text class="text-xs font-semibold">{label}</Text>
</View>
