<script lang="ts">
  import { View } from "nsh";

  let {
    checked = false,
    onChange,
    disabled = false,
    testID = "",
    class: className = "",
  } = $props<{
    checked?: boolean;
    onChange?: (val: boolean) => void;
    disabled?: boolean;
    testID?: string;
    class?: string;
  }>();

  function toggle() {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  }
</script>

<View
  role="switch"
  testID={testID}
  disabled={disabled}
  onPress={toggle}
  class="h-6 w-11 flex-row items-center rounded-full p-0.5 transition active:opacity-80 disabled:opacity-40 {checked ? 'bg-primary justify-end' : 'bg-muted justify-start'} {className}"
>
  <View class="h-5 w-5 rounded-full bg-white shadow-sm" />
</View>
