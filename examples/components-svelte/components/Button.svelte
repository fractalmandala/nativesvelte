<script lang="ts">
  import { View } from "nsh";

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    onPress,
    testID = "",
    class: className = "",
    children,
  } = $props<{
    variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onPress?: () => void;
    testID?: string;
    class?: string;
    children?: any;
  }>();

  const variantStyles: Record<string, string> = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-white",
    outline: "border border-border bg-transparent text-foreground",
    ghost: "bg-transparent text-foreground hover:bg-muted",
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
</script>

<View
  role="button"
  testID={testID}
  disabled={disabled}
  onPress={disabled ? undefined : onPress}
  class="flex-row items-center justify-center rounded-lg font-medium transition active:opacity-75 disabled:opacity-40 {variantStyles[variant] || variantStyles.primary} {sizeStyles[size] || sizeStyles.md} {className}"
>
  {children}
</View>
